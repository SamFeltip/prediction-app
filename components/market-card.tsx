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
import { markets, bets } from "@/lib/schema";
import { InferSelectModel } from "drizzle-orm";

type MarketModel = InferSelectModel<typeof markets>;
type BetModel = InferSelectModel<typeof bets>;

export type MarketWithBets = MarketModel & { bets: BetModel[] };

export function MarketCard({
  marketWithBets,
}: {
  marketWithBets: MarketWithBets;
}) {
  const market = marketWithBets;

  const yes_points = marketWithBets.bets
    ?.filter((bet) => bet?.prediction === true)
    .reduce((sum, bet) => sum + (bet?.points || 0), 0);
  const no_points = marketWithBets.bets
    ?.filter((bet) => bet?.prediction === false)
    .reduce((sum, bet) => sum + (bet?.points || 0), 0);
  const betCount = marketWithBets.bets?.length || 0;

  const totalPoints = Number(yes_points) + Number(no_points);
  const yesPercentage =
    totalPoints > 0 ? Math.round((Number(yes_points) / totalPoints) * 100) : 50;

  const deadline = new Date(market.deadline);
  const isExpired = deadline < new Date();

  return (
    <Card className="flex flex-col transition-colors hover:border-primary/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-balance font-semibold leading-tight text-foreground">
            {market.title}
          </h3>
          {market.resolved && (
            <Badge
              variant={market.outcome ? "default" : "destructive"}
              className="shrink-0 text-xs"
            >
              {market.outcome ? "YES" : "NO"}
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
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-accent">
              Yes {yesPercentage}%
            </span>
            <span className="font-medium text-destructive">
              No {100 - yesPercentage}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${yesPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{betCount} bets</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>{totalPoints} pts</span>
          </div>
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className={isExpired ? "text-destructive" : ""}>
            {market.resolved ? "Resolved" : isExpired ? "Expired" : "Ends"}{" "}
            {deadline.toLocaleDateString()}
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/market/${market.id}`}>
            {market.resolved
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
