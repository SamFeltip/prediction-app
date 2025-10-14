import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { marketId, prediction, points } = body

    if (typeof marketId !== "number" || typeof prediction !== "boolean" || typeof points !== "number") {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    if (points <= 0) {
      return NextResponse.json({ error: "Points must be greater than 0" }, { status: 400 })
    }

    // Check if market exists and is not resolved
    const markets = await sql`
      SELECT * FROM markets WHERE id = ${marketId}
    `

    if (markets.length === 0) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 })
    }

    const market = markets[0]

    if (market.resolved) {
      return NextResponse.json({ error: "Market is already resolved" }, { status: 400 })
    }

    if (new Date(market.deadline) < new Date()) {
      return NextResponse.json({ error: "Market deadline has passed" }, { status: 400 })
    }

    // Check user has enough points
    const userPointsResult = await sql`
      SELECT points FROM user_points WHERE user_id = ${session.user.id}
    `

    const userPoints = userPointsResult[0]?.points ?? 1000

    if (points > userPoints) {
      return NextResponse.json({ error: "Insufficient points" }, { status: 400 })
    }

    // Check if user already bet on this market
    const existingBets = await sql`
      SELECT * FROM bets WHERE user_id = ${session.user.id} AND market_id = ${marketId}
    `

    if (existingBets.length > 0) {
      return NextResponse.json({ error: "You have already bet on this market" }, { status: 400 })
    }

    // Place bet and deduct points in a transaction
    await sql.transaction([
      sql`
        INSERT INTO bets (market_id, user_id, prediction, points)
        VALUES (${marketId}, ${session.user.id}, ${prediction}, ${points})
      `,
      sql`
        INSERT INTO user_points (user_id, points, updated_at)
        VALUES (${session.user.id}, ${userPoints - points}, NOW())
        ON CONFLICT (user_id) 
        DO UPDATE SET points = ${userPoints - points}, updated_at = NOW()
      `,
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error placing bet:", error)
    return NextResponse.json({ error: "Failed to place bet" }, { status: 500 })
  }
}
