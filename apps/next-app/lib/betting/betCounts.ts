import { eq, InferSelectModel } from "drizzle-orm";
import { db } from "../db";
import { answers, bets, markets, rooms } from "../../../packages/lib/schema";

type BetModel = InferSelectModel<typeof bets>;

type AnswersWithBets = InferSelectModel<typeof answers> & {
  bets: Record<number, BetModel>;
};

export type MarketWithBets = InferSelectModel<typeof markets> & {
  rooms: InferSelectModel<typeof rooms>;
  answers: Record<number, AnswersWithBets>;
};

export async function getMarketWithBetsAndAnswers(
  marketId: number
): Promise<MarketWithBets> {
  const marketBets = await db
    .select()
    .from(markets)
    .innerJoin(rooms, eq(rooms.id, markets.roomId))
    .leftJoin(answers, eq(markets.id, answers.marketId))
    .leftJoin(bets, eq(bets.answerId, answers.id))
    .where(eq(markets.id, marketId));

  console.log("marketBets");

  if (marketBets[0]?.markets == null) {
    throw new Error("Market not found");
  }

  const market: MarketWithBets = {
    ...marketBets[0].markets,
    rooms: { ...marketBets[0].rooms },
    answers: {},
  };

  marketBets.forEach(({ bets, answers }) => {
    if (answers === null) {
      return;
    }

    const answerId = answers.id;

    if (answerId in market.answers) {
      if (bets === null) {
        return;
      }
      const betId = bets?.id;
      market.answers[answerId].bets[betId] = bets;
    } else {
      let betsRecord = {};
      if (bets !== null) {
        betsRecord = {
          [bets.id]: bets,
        };
      }

      const answerWithBet = {
        ...answers,
        bets: betsRecord,
      };

      market.answers[answerId] = answerWithBet;
    }
  });

  return market;
}

export async function getBets(marketId: number) {
  return await db.select().from(bets).where(eq(bets.marketId, marketId));
}
