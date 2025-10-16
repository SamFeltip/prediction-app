import { Suspense } from "react";
import { MarketList } from "@/components/market-list";
import { CreateMarketButton } from "@/components/create-market-button";
import { UserNav } from "@/components/user-nav";
import { TrendingUp } from "lucide-react";
import { Header } from "@/components/Header";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-4">
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold text-foreground">
            Active Wagers
          </h2>
          <p className="text-muted-foreground">Place your bets on wagers</p>
        </div>

        <Suspense
          fallback={
            <div className="text-muted-foreground">Loading wagers...</div>
          }
        >
          <MarketList />
        </Suspense>
      </main>
    </>
  );
}
