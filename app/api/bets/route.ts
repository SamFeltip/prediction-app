import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { markets, bets, userPoints } from "@/lib/schema";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { marketId, prediction, points } = body;

    if (typeof marketId !== "number" || typeof prediction !== "boolean" || typeof points !== "number") {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    if (points <= 0) {
      return NextResponse.json({ error: "Points must be greater than 0" }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      // Check if market exists and is not resolved
      const market = await tx.query.markets.findFirst({
        where: eq(markets.id, marketId),
      });

      if (!market) {
        return NextResponse.json({ error: "Market not found" }, { status: 404 });
      }

      if (market.resolved) {
        return NextResponse.json({ error: "Market is already resolved" }, { status: 400 });
      }

      if (new Date(market.deadline) < new Date()) {
        return NextResponse.json({ error: "Market deadline has passed" }, { status: 400 });
      }

      // Check user has enough points
      const userPointsRecord = await tx.query.userPoints.findFirst({
        where: eq(userPoints.userId, session.user.id),
      });

      const currentUserPoints = userPointsRecord?.points ?? 1000;

      if (points > currentUserPoints) {
        return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
      }

      // Check if user already bet on this market
      const existingBet = await tx.query.bets.findFirst({
        where: and(eq(bets.userId, session.user.id), eq(bets.marketId, marketId)),
      });

      if (existingBet) {
        return NextResponse.json({ error: "You have already bet on this market" }, { status: 400 });
      }

      // Place bet and deduct points
      await tx.insert(bets).values({
        marketId,
        userId: session.user.id,
        prediction,
        points,
      });

      await tx.insert(userPoints).values({
        userId: session.user.id,
        points: currentUserPoints - points,
      }).onConflictDoUpdate({
        target: userPoints.userId,
        set: { points: currentUserPoints - points },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Error placing bet:", error);
    return NextResponse.json({ error: "Failed to place bet" }, { status: 500 });
  }
}