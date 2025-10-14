import { eq } from "drizzle-orm";
import { db } from "../db";
import { bets } from "../schema";

export async function getBetCounts(marketId: number) {
  const b = await db.select().from(bets).where(eq(bets.marketId, marketId));

  const predictFalse = b.filter((bet) => bet.prediction === false).length;
  const predictTrue = b.filter((bet) => bet.prediction === true).length;
  const betCount = b.length;

  return { predictFalse, predictTrue, betCount };
}
