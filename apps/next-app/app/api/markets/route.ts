import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/apps/next-app/lib/db";
import { auth } from "@/apps/next-app/lib/auth";
import { headers } from "next/headers";
import { and, countDistinct, eq, isNull, sum } from "drizzle-orm";
import { markets, bets, answers } from "@lib/schema";
import { sql } from "drizzle-orm";

// export async function GET() {
//   try {
//     const marketStats = await db
//       .select({
//         ...markets,
//         betCount: countDistinct(bets.id),
//         yesBets: countDistinct(sql`case when ${bets.prediction} = true then ${bets.id} end`),
//         noBets: countDistinct(sql`case when ${bets.prediction} = false then ${bets.id} end`),
//         yesPoints: sql<number>`coalesce(sum(case when ${bets.prediction} = true then ${bets.points} end), 0)`,
//         noPoints: sql<number>`coalesce(sum(case when ${bets.prediction} = false then ${bets.points} end), 0)`,
//       })
//       .from(markets)
//       .leftJoin(bets, eq(markets.id, bets.marketId))
//       .where(eq(markets.resolved, false))
//       .groupBy(markets.id)
//       .orderBy(markets.createdAt);

//     return NextResponse.json({ markets: marketStats });
//   } catch (error) {
//     console.error("[v0] Error fetching markets:", error);
//     return NextResponse.json({ error: "Failed to fetch markets" }, { status: 500 });
//   }
// }

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
      { error: "Failed to create market" },
      { status: 500 }
    );
  }
}
