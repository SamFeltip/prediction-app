import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const marketId = Number.parseInt(id)

    if (isNaN(marketId)) {
      return NextResponse.json({ error: "Invalid market ID" }, { status: 400 })
    }

    const body = await request.json()
    const { outcome } = body

    if (typeof outcome !== "boolean") {
      return NextResponse.json({ error: "Outcome must be true or false" }, { status: 400 })
    }

    // Get market and verify creator
    const markets = await sql`
      SELECT * FROM markets WHERE id = ${marketId}
    `

    if (markets.length === 0) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 })
    }

    const market = markets[0]

    if (market.creator_id !== session.user.id) {
      return NextResponse.json({ error: "Only the creator can resolve this market" }, { status: 403 })
    }

    if (market.resolved) {
      return NextResponse.json({ error: "Market is already resolved" }, { status: 400 })
    }

    if (new Date(market.deadline) > new Date()) {
      return NextResponse.json({ error: "Cannot resolve before deadline" }, { status: 400 })
    }

    // Get all bets for this market
    const bets = await sql`
      SELECT * FROM bets WHERE market_id = ${marketId}
    `

    // Calculate points distribution
    const winningBets = bets.filter((bet: any) => bet.prediction === outcome)
    const losingBets = bets.filter((bet: any) => bet.prediction !== outcome)

    const totalLosingPoints = losingBets.reduce((sum: number, bet: any) => sum + Number(bet.points), 0)
    const totalWinningPoints = winningBets.reduce((sum: number, bet: any) => sum + Number(bet.points), 0)

    // Distribute points to winners proportionally
    const pointsUpdates = []

    for (const bet of winningBets) {
      const betPoints = Number(bet.points)
      // Winner gets their stake back plus proportional share of losing points
      const winnings = totalWinningPoints > 0 ? Math.floor((betPoints / totalWinningPoints) * totalLosingPoints) : 0
      const totalReturn = betPoints + winnings

      // Get current user points
      const userPointsResult = await sql`
        SELECT points FROM user_points WHERE user_id = ${bet.user_id}
      `
      const currentPoints = userPointsResult[0]?.points ?? 1000

      pointsUpdates.push(
        sql`
          INSERT INTO user_points (user_id, points, updated_at)
          VALUES (${bet.user_id}, ${currentPoints + totalReturn}, NOW())
          ON CONFLICT (user_id) 
          DO UPDATE SET points = ${currentPoints + totalReturn}, updated_at = NOW()
        `,
      )
    }

    // Execute all updates in a transaction
    await sql.transaction([
      sql`
        UPDATE markets 
        SET resolved = true, outcome = ${outcome}, updated_at = NOW()
        WHERE id = ${marketId}
      `,
      ...pointsUpdates,
    ])

    return NextResponse.json({ success: true, outcome })
  } catch (error) {
    console.error("[v0] Error resolving market:", error)
    return NextResponse.json({ error: "Failed to resolve market" }, { status: 500 })
  }
}
