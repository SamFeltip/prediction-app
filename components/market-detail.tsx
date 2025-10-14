import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { markets } from "@/lib/schema";
import { InferSelectModel } from "drizzle-orm";

type MarketDetailProps = InferSelectModel<typeof markets>;

export function MarketDetail({
  market,
  yesPoints,
  noPoints,
  betCount,
}: {
  market: MarketDetailProps;
  yesPoints: number;
  noPoints: number;
  betCount: number;
}) {
  const totalPoints = Number(yesPoints) + Number(noPoints);
  const yesPercentage =
    totalPoints > 0 ? Math.round((Number(yesPoints) / totalPoints) * 100) : 50;

  const deadline = new Date(market.deadline);
  const isExpired = deadline < new Date();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-2xl text-balance leading-tight">
            {market.title}
          </CardTitle>
          {market.resolved && (
            <Badge
              variant={market.outcome ? "default" : "destructive"}
              className="shrink-0"
            >
              {market.outcome ? "Resolved: YES" : "Resolved: NO"}
            </Badge>
          )}
          {!market.resolved && isExpired && (
            <Badge variant="secondary" className="shrink-0">
              Awaiting Resolution
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {market.description && (
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              Description
            </h3>
            <p className="text-foreground">{market.description}</p>
          </div>
        )}

        {/* Probability Visualization */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            {market.resolved ? "Final Result" : "Current Prediction"}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-accent">
                YES {yesPercentage}%
              </span>
              <span className="text-2xl font-bold text-destructive">
                NO {100 - yesPercentage}%
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${yesPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Total Bets</span>
            </div>
            <p className="text-2xl font-bold">{betCount}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Total Points</span>
            </div>
            <p className="text-2xl font-bold">{totalPoints}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Deadline</span>
            </div>
            <p className="text-sm font-medium">
              {deadline.toLocaleDateString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {deadline.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
