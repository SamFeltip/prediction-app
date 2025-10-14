import { sql } from "@/lib/db"
import { MarketCard } from "@/components/market-card"

export async function MarketList() {
  const markets = await sql`
    SELECT 
      m.*,
      COUNT(DISTINCT b.id) as bet_count,
      COALESCE(SUM(CASE WHEN b.prediction = true THEN b.points END), 0) as yes_points,
      COALESCE(SUM(CASE WHEN b.prediction = false THEN b.points END), 0) as no_points
    FROM markets m
    LEFT JOIN bets b ON m.id = b.market_id
    GROUP BY m.id
    ORDER BY m.resolved ASC, m.created_at DESC
  `

  if (markets.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">No active markets yet. Be the first to create one!</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {markets.map((market: any) => (
        <MarketCard key={market.id} market={market} />
      ))}
    </div>
  )
}
