import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/apps/next-app/lib/db";
import { auth } from "@/apps/next-app/lib/auth";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { markets, bets, userPoints, answers } from "@lib/schema";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { marketId, answerId } = body;

    if (typeof marketId !== "number" || typeof answerId !== "number") {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Check if market exists and is not resolved
    const market = await db.query.markets.findFirst({
      where: eq(markets.id, marketId),
    });

    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    if (market.resolvedAnswer) {
      return NextResponse.json(
        { error: "Market is already resolved" },
        { status: 400 }
      );
    }

    if (new Date(market.deadline) < new Date()) {
      return NextResponse.json(
        { error: "Market deadline has passed" },
        { status: 400 }
      );
    }

    // Check if user already bet on this market
    const existingBet = await db.query.bets.findFirst({
      where: and(eq(bets.userId, session.user.id), eq(bets.marketId, marketId)),
    });

    if (existingBet) {
      return NextResponse.json(
        { error: "You have already bet on this market" },
        { status: 400 }
      );
    }

    const validAnswer = await db.query.answers.findFirst({
      where: and(eq(answers.marketId, marketId), eq(answers.id, answerId)),
    });

    if (!validAnswer) {
      return NextResponse.json(
        { error: "Invalid answer for this market" },
        { status: 400 }
      );
    }

    // Place bet
    await db.insert(bets).values({
      marketId,
      userId: session.user.id,
      answerId: answerId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Error placing bet:", error);
    return NextResponse.json({ error: "Failed to place bet" }, { status: 500 });
  }
}
