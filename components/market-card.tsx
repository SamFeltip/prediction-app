"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { markets, bets, answers } from "@/lib/schema";
import { InferSelectModel } from "drizzle-orm";
import { MarketWithBets } from "@/lib/betting/betCounts";

export type MarketWithBetCount = InferSelectModel<typeof markets> & {
  answers: Record<
    number,
    InferSelectModel<typeof answers> & { betCount: number }
  >;
};

export function MarketCard({
  marketWithBets,
}: {
  marketWithBets: MarketWithBetCount;
}) {
  const market = marketWithBets;
  const answers = Object.values(marketWithBets.answers);
  const points = answers.map((answer) => ({
    [answer.id]: answer.betCount,
  }));

  const totalBets = answers.reduce((acc, answer) => acc + answer.betCount, 0);
  const outcome =
    market.resolvedAnswer && market.answers[market.resolvedAnswer];
  const deadline = new Date(market.deadline);
  const isExpired = deadline < new Date();

  return (
    <Card className="flex flex-col transition-colors hover:border-primary/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-balance font-semibold leading-tight text-foreground">
            {market.title}
          </h3>
          {outcome && (
            <Badge
              variant={outcome ? "default" : "destructive"}
              className="shrink-0 text-xs"
            >
              {outcome.title}
            </Badge>
          )}
        </div>
        {market.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {market.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Probability Bar */}
        {answers.map((answer) => (
          <div className="space-y-2" key={answer.id}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{answer.title}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-accent transition-all"
                style={{
                  width: `${totalBets == 0 ? 0 : answer.betCount / totalBets}`,
                }}
              />
            </div>
          </div>
        ))}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{totalBets} bets</span>
          </div>
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className={isExpired ? "text-destructive" : ""}>
            {market.resolvedAnswer
              ? "Resolved"
              : isExpired
              ? "Expired"
              : "Ends"}{" "}
            {deadline.toLocaleDateString()}
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/market/${market.id}`}>
            {market.resolvedAnswer
              ? "View Results"
              : isExpired
              ? "View Market"
              : "Place Bet"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
