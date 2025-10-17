import { notFound } from "next/navigation";
import { MarketDetail } from "@/components/market-detail";
import { BettingInterface } from "@/components/betting-interface";
import { MarketBets } from "@/components/market-bets";
import { MarketResolution } from "@/components/market-resolution";
import { auth } from "@/lib/auth";
import { EditMarket } from "@/components/edit-market";
import { headers } from "next/headers";
import { Header } from "@/components/Header";
import { ArrowLeftCircle } from "lucide-react";
import {
  getMarketWithBetsAndAnswers,
  MarketWithBets,
} from "@/lib/betting/betCounts";
import { Button } from "@/components/ui/button";

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

  let marketResult: MarketWithBets;
  try {
    marketResult = await getMarketWithBetsAndAnswers(marketId);
  } catch (e) {
    console.error(e);
    notFound();
  }

  const market = marketResult;
  const isCreator = market.creatorId === userId;

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-4">
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-2">
              <div>
                <a
                  className="inline-block bg-primary text-white px-4 py-2 rounded"
                  href={`/rooms/${market.roomId}`}
                >
                  <ArrowLeftCircle className="inline-block pe-2" />
                  go back to room {market.roomId}
                </a>
              </div>
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  <MarketDetail market={market} />
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
        </div>
      </main>
    </>
  );
}
