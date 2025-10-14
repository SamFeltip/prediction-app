import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { eq } from "drizzle-orm";
import { bets, users } from "@/lib/schema";

interface MarketBetsProps {
  marketId: number;
}

export async function MarketBets({ marketId }: MarketBetsProps) {
  const betDetails = await db
    .select()
    .from(bets)
    .where(eq(bets.marketId, marketId))
    .leftJoin(users, eq(bets.userId, users.id))
    .orderBy(bets.createdAt)
    .limit(50);

  if (betDetails.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Bets</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            No bets placed yet. Be the first!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bets ({betDetails.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {betDetails.map((betDetail) => {
            const initials =
              betDetail.users?.name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase() || "U";

            return (
              <div
                key={betDetail.bets.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {betDetail.users?.name || "Anonymous"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {betDetail.bets.createdAt &&
                        new Date(betDetail.bets.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      betDetail.bets.prediction ? "default" : "destructive"
                    }
                    className="min-w-[50px] justify-center"
                  >
                    {betDetail.bets.prediction ? "YES" : "NO"}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
