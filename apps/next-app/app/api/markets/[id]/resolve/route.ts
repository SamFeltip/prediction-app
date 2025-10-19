import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/apps/next-app/lib/db";
import { auth } from "@/apps/next-app/lib/auth";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { markets, bets, answers, user } from "@lib/schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
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
  const { answerId } = body;

  if (typeof answerId !== "number") {
    return NextResponse.json(
      { error: "answerId must be a valid id" },
      { status: 400 }
    );
  }

  try {
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

    if (market.resolvedAnswer) {
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

    const validAnswer = await db.query.answers.findFirst({
      where: and(eq(answers.id, answerId), eq(answers.marketId, marketId)),
    });

    if (!validAnswer) {
      return NextResponse.json(
        { error: "answerId must be a valid answer for this market" },
        { status: 400 }
      );
    }

    // Mark the market as resolved
    await db
      .update(markets)
      .set({
        resolvedAnswer: answerId,
      })
      .where(eq(markets.id, marketId));

    // Get all bets for this market
    const allBets = await db
      .select()
      .from(bets)
      .innerJoin(user, eq(user.id, bets.userId))
      .where(eq(bets.marketId, marketId));

    // Calculate points distribution
    const winningBets = allBets.filter((row) => row.bets.answerId === answerId);
    const losingBets = allBets.filter((row) => row.bets.answerId !== answerId);

    const totalLosingPoints = losingBets.length;

    // Distribute points to winners proportionally
    for (const row of winningBets) {
      const currentPoints = row.user.points;

      await db.update(user).set({
        points: currentPoints + totalLosingPoints,
      });
    }

    for (const row of losingBets) {
      const currentPoints = row.user.points;

      const companionLooserBets = losingBets.filter(
        (b) => b.bets.answerId === row.bets.answerId
      );

      await db.update(user).set({
        points: currentPoints - companionLooserBets.length,
      });
    }

    return NextResponse.json({ success: true, answerId });
  } catch (error) {
    console.error("[v0] Error resolving market:", error);
    return NextResponse.json(
      { error: "Failed to resolve market" },
      { status: 500 }
    );
  }
}
