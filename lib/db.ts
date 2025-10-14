import { neon } from "@neondatabase/serverless"

// Create a reusable SQL client
export const sql = neon(process.env.DATABASE_URL!)

// Database types
export interface Market {
  id: number
  title: string
  description: string | null
  creator_id: string
  deadline: Date
  resolved: boolean
  outcome: boolean | null
  created_at: Date
  updated_at: Date
}

export interface Bet {
  id: number
  market_id: number
  user_id: string
  prediction: boolean
  points: number
  created_at: Date
}

export interface UserPoints {
  user_id: string
  points: number
  updated_at: Date
}

// Helper to get user points
export async function getUserPoints(userId: string): Promise<number> {
  const result = await sql`
    SELECT points FROM user_points WHERE user_id = ${userId}
  `
  return result[0]?.points ?? 1000
}

// Helper to update user points
export async function updateUserPoints(userId: string, points: number): Promise<void> {
  await sql`
    INSERT INTO user_points (user_id, points, updated_at)
    VALUES (${userId}, ${points}, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET points = ${points}, updated_at = NOW()
  `
}
