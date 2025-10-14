import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await sql`
      SELECT points FROM user_points WHERE user_id = ${session.user.id}
    `

    const points = result[0]?.points ?? 1000

    return NextResponse.json({ points })
  } catch (error) {
    console.error("[v0] Error fetching user points:", error)
    return NextResponse.json({ error: "Failed to fetch points" }, { status: 500 })
  }
}
