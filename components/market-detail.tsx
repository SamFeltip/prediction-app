import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { markets } from "@/lib/schema";
import { InferSelectModel } from "drizzle-orm";
import { MarketWithBets } from "@/lib/betting/betCounts";

type MarketDetailProps = InferSelectModel<typeof markets>;

export function MarketDetail({ market }: { market: MarketWithBets }) {
  const betCount = Object.values(market.answers).reduce((acc, x) => {
    return acc + Object.keys(x.bets).length;
  }, 0);

  const deadline = new Date(market.deadline);
  const isExpired = deadline < new Date();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-2xl text-balance leading-tight">
            {market.title}
          </CardTitle>
          {market.resolvedAnswer && (
            <Badge variant={"default"} className="shrink-0">
              {market.answers[market.resolvedAnswer].title}
            </Badge>
          )}
          {!market.resolvedAnswer && isExpired && (
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
            {market.resolvedAnswer ? "Final Result" : "Current Prediction"}
          </h3>
          {Object.values(market.answers).map((answer) => (
            <div className="space-y-2" key={answer.id}>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold ">{answer.title}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-accent transition-all"
                  style={{
                    width: `${
                      betCount == 0
                        ? 0
                        : Object.values(answer.bets).length / betCount
                    }`,
                  }}
                />
              </div>
            </div>
          ))}
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
