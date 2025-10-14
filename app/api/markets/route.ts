import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET() {
  try {
    const markets = await sql`
      SELECT 
        m.*,
        COUNT(DISTINCT b.id) as bet_count,
        COUNT(DISTINCT CASE WHEN b.prediction = true THEN b.id END) as yes_bets,
        COUNT(DISTINCT CASE WHEN b.prediction = false THEN b.id END) as no_bets,
        COALESCE(SUM(CASE WHEN b.prediction = true THEN b.points END), 0) as yes_points,
        COALESCE(SUM(CASE WHEN b.prediction = false THEN b.points END), 0) as no_points
      FROM markets m
      LEFT JOIN bets b ON m.id = b.market_id
      WHERE m.resolved = false
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `

    return NextResponse.json({ markets })
  } catch (error) {
    console.error("[v0] Error fetching markets:", error)
    return NextResponse.json({ error: "Failed to fetch markets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, deadline } = body

    if (!title || !deadline) {
      return NextResponse.json({ error: "Title and deadline are required" }, { status: 400 })
    }

    const deadlineDate = new Date(deadline)
    if (deadlineDate <= new Date()) {
      return NextResponse.json({ error: "Deadline must be in the future" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO markets (title, description, creator_id, deadline)
      VALUES (${title}, ${description || null}, ${session.user.id}, ${deadlineDate.toISOString()})
      RETURNING *
    `

    return NextResponse.json({ market: result[0] })
  } catch (error) {
    console.error("[v0] Error creating market:", error)
    return NextResponse.json({ error: "Failed to create market" }, { status: 500 })
  }
}
