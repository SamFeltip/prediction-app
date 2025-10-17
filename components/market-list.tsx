import { db } from "@/lib/db";
import { MarketCard, MarketWithBetCount } from "@/components/market-card";
import { count, countDistinct, eq, sql, sum } from "drizzle-orm";
import { markets, bets, answers } from "@/lib/schema";
import { MarketWithBets } from "@/lib/betting/betCounts";
import { Description } from "@radix-ui/react-dialog";


type MarketListProps = {
  roomId?: number;
};

export async function MarketList({ roomId }: MarketListProps = {}) {
  const whereClause = roomId ? eq(markets.roomId, roomId) : undefined;
  const query = db
    .select({
      markets: { ...markets },
      answers: { ...answers },
      betCount: count(bets.id),
    })
    .from(markets)
    .leftJoin(answers, eq(markets.id, answers.marketId))
    .leftJoin(bets, eq(answers.id, bets.answerId))
    .groupBy(markets.id, answers.id)
    .orderBy(markets.resolvedAnswer, markets.createdAt);
  const marketStats = whereClause ? await query.where(whereClause) : await query;

  console.log(marketStats);

  let marketResults: Record<number, MarketWithBetCount> = [];

  marketStats.forEach((element) => {
    const marketId = element.markets.id;
    if (marketId in marketResults) {
      if (element.answers === null) {
        return;
      }
      const answerId = element.answers.id;
      marketResults[marketId].answers[answerId] = {
        ...element.answers,
        betCount: element.betCount,
      };
    } else {
      let s = element.markets;
      if (element.answers == null) {
        return;
      }

      marketResults[marketId] = {
        ...element.markets,
        answers: {
          [element.answers.id]: {
            ...element.answers,
            betCount: element.betCount,
          },
        },
      };
    }
  });

  console.log(marketStats);

  if (marketStats.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">
          No active wagers yet. Be the first to create one!
        </p>
      </div>
    );
  }

  // TODO: use betCounts code to get all markets with their answers and bets

  // const marketsWithBets = Object.values(
  //   marketStats.reduce(
  //     (acc: Record<number, MarketWithBetCount>, { markets, bets }) => {
  //       // Ensure market exists in accumulator
  //       if (!acc[markets.id]) {
  //         acc[markets.id] = { ...markets, bets: [] };
  //       }

  //       // Push bet if present
  //       if (bets && bets.id) {
  //         acc[markets.id].bets.push(bets);
  //       }

  //       return acc;
  //     },
  //     {}
  //   )
  // );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Object.values(marketResults).map((marketWithBets) => {
        return (
          <MarketCard key={marketWithBets.id} marketWithBets={marketWithBets} />
        );
      })}
    </div>
  );
}
