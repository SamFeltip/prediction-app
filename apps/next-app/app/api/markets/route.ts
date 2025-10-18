import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/apps/next-app/lib/db";
import { auth } from "@/apps/next-app/lib/auth";
import { headers } from "next/headers";
import { and, countDistinct, eq, isNull, sum } from "drizzle-orm";
import { markets, bets, answers } from "@lib/schema";
import { sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      deadline,
      roomId,
      answers: answersRequest,
    } = body;

    if (!title || !deadline || !answersRequest || !roomId) {
      return NextResponse.json(
        { error: "Title and deadline and answers are required" },
        { status: 400 }
      );
    }

    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      return NextResponse.json(
        { error: "Deadline must be in the future" },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(answersRequest) ||
      answersRequest.length < 2 ||
      answersRequest.some((answer) => typeof answer.title !== "string")
    ) {
      return NextResponse.json(
        { error: "answersRequest were incorrect" },
        { status: 404 }
      );
    }

    const newMarketResult = await db
      .insert(markets)
      .values({
        title,
        description,
        roomId,
        creatorId: session.user.id,
        deadline: deadlineDate,
      })
      .returning();
    const newMarket = newMarketResult[0];
    const newAnswers = await db
      .insert(answers)
      .values(
        answersRequest.map((answer) => ({
          title: answer.title,
          marketId: newMarket.id,
        }))
      )
      .returning();

    return NextResponse.json({ market: newMarket, answers: newAnswers });
  } catch (error) {
    console.error("[v0] Error creating market:", error);
    return NextResponse.json(
      { error: "Failed to create wager" },
      { status: 500 }
    );
  }
}
