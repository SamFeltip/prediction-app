import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { markets, bets, userPoints } from "@/lib/schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const marketId = Number.parseInt(id);

    if (isNaN(marketId)) {
      return NextResponse.json({ error: "Invalid market ID" }, { status: 400 });
    }

    const body = await request.json();
    const { outcome } = body;

    if (typeof outcome !== "boolean") {
      return NextResponse.json(
        { error: "Outcome must be true or false" },
        { status: 400 }
      );
    }

    // Get market and verify creator
    const market = await db.query.markets.findFirst({
      where: eq(markets.id, marketId),
    });

    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    if (market.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the creator can resolve this market" },
        { status: 403 }
      );
    }

    if (market.resolved) {
      return NextResponse.json(
        { error: "Market is already resolved" },
        { status: 400 }
      );
    }

    if (new Date(market.deadline) > new Date()) {
      return NextResponse.json(
        { error: "Cannot resolve before deadline" },
        { status: 400 }
      );
    }

    // Get all bets for this market
    const allBets = await db.query.bets.findMany({
      where: eq(bets.marketId, marketId),
    });

    // Calculate points distribution
    const winningBets = allBets.filter((bet) => bet.prediction === outcome);
    const losingBets = allBets.filter((bet) => bet.prediction !== outcome);

    const totalLosingPoints = losingBets.length;
    const totalWinningPoints = winningBets.length;

    // Distribute points to winners proportionally
    for (const bet of winningBets) {
      const userPointsRecord = await db.query.userPoints.findFirst({
        where: eq(userPoints.userId, bet.userId),
      });

      if (userPointsRecord === undefined) {
        continue;
      }

      const currentPoints = userPointsRecord.points;

      await db.insert(userPoints).values({
        userId: bet.userId,
        points: currentPoints + totalLosingPoints,
      });
    }

    for (const bet of losingBets) {
      const userPointsRecord = await db.query.userPoints.findFirst({
        where: eq(userPoints.userId, bet.userId),
      });

      if (userPointsRecord === undefined) {
        continue;
      }

      const currentPoints = userPointsRecord.points;

      await db.insert(userPoints).values({
        userId: bet.userId,
        points: currentPoints - totalWinningPoints,
      });
    }

    // Mark the market as resolved
    await db
      .update(markets)
      .set({
        resolved: true,
        outcome,
      })
      .where(eq(markets.id, marketId));

    return NextResponse.json({ success: true, outcome });
  } catch (error) {
    console.error("[v0] Error resolving market:", error);
    return NextResponse.json(
      { error: "Failed to resolve market" },
      { status: 500 }
    );
  }
}
