import { notFound } from "next/navigation";
import { MarketDetail } from "@/apps/next-app/components/market-detail";
import { BettingInterface } from "@/apps/next-app/components/betting-interface";
import { MarketBets } from "@/apps/next-app/components/market-bets";
import { MarketResolution } from "@/apps/next-app/components/market-resolution";
import { auth } from "@/apps/next-app/lib/auth";
import { EditMarket } from "@/apps/next-app/components/edit-market";
import { headers } from "next/headers";
import { Header } from "@/apps/next-app/components/Header";
import { ArrowLeftCircle } from "lucide-react";
import {
  getMarketWithBetsAndAnswers,
  MarketWithBets,
} from "@/apps/next-app/lib/betting/betCounts";
import { Button } from "@/apps/next-app/components/ui/button";
import Link from "next/link";
import { Main } from "@/apps/next-app/components/main";

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
      <Main>
        <div className="flex flex-col gap-3">
          <div>
            <Link
              className="inline-block bg-primary text-white px-4 py-2 rounded"
              href={`/rooms/${market.roomId}`}
            >
              <ArrowLeftCircle className="inline-block pe-2" />
              go back to room {marketResult.rooms.title}
            </Link>
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
      </Main>
    </>
  );
}
