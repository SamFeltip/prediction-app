import { db } from "@/lib/db";
import { MarketCard } from "@/components/market-card";
import { eq, countDistinct, sql } from "drizzle-orm";
import { markets, bets } from "@/lib/schema";

export async function MarketList() {
  const marketStats = await db
    .select({
      ...markets,
      betCount: countDistinct(bets.id),
      yesPoints: sql<number>`coalesce(sum(case when ${bets.prediction} = true then ${bets.points} end), 0)`,
      noPoints: sql<number>`coalesce(sum(case when ${bets.prediction} = false then ${bets.points} end), 0)`,
    })
    .from(markets)
    .leftJoin(bets, eq(markets.id, bets.marketId))
    .groupBy(markets.id)
    .orderBy(markets.resolved, markets.createdAt);

  if (marketStats.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">No active markets yet. Be the first to create one!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {marketStats.map((market) => (
        <MarketCard key={market.id} market={market} />
      ))}
    </div>
  );
}