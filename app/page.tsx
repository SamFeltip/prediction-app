import { Suspense } from "react"
import { MarketList } from "@/components/market-list"
import { CreateMarketButton } from "@/components/create-market-button"
import { UserNav } from "@/components/user-nav"
import { TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">PredictHub</h1>
          </div>
          <div className="flex items-center gap-4">
            <CreateMarketButton />
            <UserNav />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold text-foreground">Active Markets</h2>
          <p className="text-muted-foreground">Place your bets on binary prediction markets</p>
        </div>

        <Suspense fallback={<div className="text-muted-foreground">Loading markets...</div>}>
          <MarketList />
        </Suspense>
      </main>
    </div>
  )
}
