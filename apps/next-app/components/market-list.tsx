import { db } from "@/apps/next-app/lib/db";
import {
  MarketCard,
  MarketWithBetCount,
} from "@/apps/next-app/components/market-card";
import { count, eq } from "drizzle-orm";
import { markets, bets, answers } from "@lib/schema";

type MarketListProps = {
  roomId: number;
};

export async function MarketList({ roomId }: MarketListProps) {
  const marketStats = await db
    .select({
      markets: { ...markets },
      answers: { ...answers },
      betCount: count(bets.id),
    })
    .from(markets)
    .leftJoin(answers, eq(markets.id, answers.marketId))
    .leftJoin(bets, eq(answers.id, bets.answerId))
    .where(eq(markets.roomId, roomId))
    .groupBy(markets.id, answers.id)
    .orderBy(markets.resolvedAnswer, markets.createdAt);

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

  if (marketStats.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">
          No active wagers yet. Be the first to create one!
        </p>
      </div>
    );
  }

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
