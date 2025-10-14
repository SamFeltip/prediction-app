import { db } from "@/lib/db";
import { MarketCard, MarketWithBets } from "@/components/market-card";
import { eq } from "drizzle-orm";
import { markets, bets } from "@/lib/schema";

export async function MarketList() {
  const marketStats = await db
    .select()
    .from(markets)
    .leftJoin(bets, eq(markets.id, bets.marketId))
    .orderBy(markets.resolved, markets.createdAt);

  if (marketStats.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">
          No active wagers yet. Be the first to create one!
        </p>
      </div>
    );
  }

  const marketsWithBets = Object.values(
    marketStats.reduce(
      (acc: Record<number, MarketWithBets>, { markets, bets }) => {
        // Ensure market exists in accumulator
        if (!acc[markets.id]) {
          acc[markets.id] = { ...markets, bets: [] };
        }

        // Push bet if present
        if (bets && bets.id) {
          acc[markets.id].bets.push(bets);
        }

        return acc;
      },
      {}
    )
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {marketsWithBets.map((marketWithBets) => {
        return (
          <MarketCard key={marketWithBets.id} marketWithBets={marketWithBets} />
        );
      })}
    </div>
  );
}
