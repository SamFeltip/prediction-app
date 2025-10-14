import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MarketDetail } from "@/components/market-detail";
import { BettingInterface } from "@/components/betting-interface";
import { MarketBets } from "@/components/market-bets";
import { MarketResolution } from "@/components/market-resolution";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { eq, countDistinct, sql } from "drizzle-orm";
import { markets, bets } from "@/lib/schema";

interface MarketPageProps {
  params: Promise<{ id: string }>;
}

export default async function MarketPage({ params }: MarketPageProps) {
  const { id } = await params;
  const marketId = Number.parseInt(id);

  if (isNaN(marketId)) {
    notFound();
  }

  const marketResults = await db
    .select()
    .from(markets)
    .where(eq(markets.id, marketId))
    .limit(1);

  const b = await db.select().from(bets).where(eq(bets.marketId, marketId));

  const predictFalse = b.filter((bet) => bet.prediction === false).length;
  const predictTrue = b.filter((bet) => bet.prediction === true).length;
  // const marketResults = await db
  //   .select({
  //     ...markets,
  //     yesPoints: sql<number>`coalesce(sum(case when ${bets.prediction} = true then ${bets.points} end), 0)`,
  //     noPoints: sql<number>`coalesce(sum(case when ${bets.prediction} = false then ${bets.points} end), 0)`,
  //     betCount: countDistinct(bets.id),
  //   })
  //   .from(markets)
  //   .leftJoin(bets, eq(markets.id, bets.marketId))
  //   .where(eq(markets.id, marketId))
  //   .groupBy(markets.id);

  if (marketResults.length === 0) {
    notFound();
  }

  const market = marketResults[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Markets
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <MarketDetail
              market={market}
              yesPoints={predictTrue}
              noPoints={predictFalse}
            />
            <MarketResolution market={market} />
            <MarketBets marketId={marketId} />
          </div>

          <div className="lg:col-span-1">
            <BettingInterface market={market} />
          </div>
        </div>
      </div>
    </div>
  );
}
