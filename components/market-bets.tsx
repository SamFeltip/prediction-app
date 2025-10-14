import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface MarketBetsProps {
  marketId: number
}

export async function MarketBets({ marketId }: MarketBetsProps) {
  const bets = await sql`
    SELECT 
      b.*,
      u.name,
      u.email
    FROM bets b
    JOIN neon_auth.users_sync u ON b.user_id = u.id
    WHERE b.market_id = ${marketId}
    ORDER BY b.created_at DESC
    LIMIT 50
  `

  if (bets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Bets</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">No bets placed yet. Be the first!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bets ({bets.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bets.map((bet: any) => {
            const initials =
              bet.name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase() || "U"

            return (
              <div key={bet.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{bet.name || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(bet.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">{bet.points} pts</span>
                  <Badge variant={bet.prediction ? "default" : "destructive"} className="min-w-[50px] justify-center">
                    {bet.prediction ? "YES" : "NO"}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
