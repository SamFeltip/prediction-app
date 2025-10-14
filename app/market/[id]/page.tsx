import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MarketDetail } from "@/components/market-detail";
import { BettingInterface } from "@/components/betting-interface";
import { MarketBets } from "@/components/market-bets";
import { MarketResolution } from "@/components/market-resolution";
import { eq } from "drizzle-orm";
import { markets } from "@/lib/schema";
import { getBetCounts } from "@/lib/betting/betCounts";
import { auth } from "@/lib/auth";
import { EditMarket } from "@/components/edit-market";
import { headers } from "next/headers";
import { DeleteMarketButton } from "@/components/delete-market-button";

interface MarketPageProps {
  params: Promise<{ id: string }>;
}

export default async function MarketPage({ params }: MarketPageProps) {
  const { id } = await params;
  const marketId = Number.parseInt(id);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;

  if (isNaN(marketId)) {
    notFound();
  }

  const marketResults = await db
    .select()
    .from(markets)
    .where(eq(markets.id, marketId))
    .limit(1);

  const { predictFalse, predictTrue, betCount } = await getBetCounts(marketId);

  if (marketResults.length === 0) {
    notFound();
  }

  const market = marketResults[0];
  const isCreator = market.creatorId === userId;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <MarketDetail
              market={market}
              yesPoints={predictTrue}
              noPoints={predictFalse}
              betCount={betCount}
            />
            <MarketResolution market={market} />
            <MarketBets marketId={marketId} />
          </div>

          <div className="lg:col-span-1 space-y-6">
            <BettingInterface market={market} />
            {isCreator && <EditMarket market={market} />}
          </div>
        </div>
      </div>
    </div>
  );
}
