import { notFound } from "next/navigation"
import { sql } from "@/lib/db"
import { MarketDetail } from "@/components/market-detail"
import { BettingInterface } from "@/components/betting-interface"
import { MarketBets } from "@/components/market-bets"
import { MarketResolution } from "@/components/market-resolution"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MarketPageProps {
  params: Promise<{ id: string }>
}

export default async function MarketPage({ params }: MarketPageProps) {
  const { id } = await params
  const marketId = Number.parseInt(id)

  if (isNaN(marketId)) {
    notFound()
  }

  const markets = await sql`
    SELECT 
      m.*,
      COALESCE(SUM(CASE WHEN b.prediction = true THEN b.points END), 0) as yes_points,
      COALESCE(SUM(CASE WHEN b.prediction = false THEN b.points END), 0) as no_points,
      COUNT(DISTINCT b.id) as bet_count
    FROM markets m
    LEFT JOIN bets b ON m.id = b.market_id
    WHERE m.id = ${marketId}
    GROUP BY m.id
  `

  if (markets.length === 0) {
    notFound()
  }

  const market = markets[0]

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
            <MarketDetail market={market} />
            <MarketResolution market={market} />
            <MarketBets marketId={marketId} />
          </div>

          <div className="lg:col-span-1">
            <BettingInterface market={market} />
          </div>
        </div>
      </div>
    </div>
  )
}
