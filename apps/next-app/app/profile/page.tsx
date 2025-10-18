import { redirect } from "next/navigation";
import { auth } from "@/apps/next-app/lib/auth";
import { headers } from "next/headers";
import { db } from "@/apps/next-app/lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/apps/next-app/components/ui/card";
import { Avatar, AvatarFallback } from "@/apps/next-app/components/ui/avatar";
import { Badge } from "@/apps/next-app/components/ui/badge";
import { Coins, TrendingUp, Trophy, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/apps/next-app/components/ui/button";
import { eq } from "drizzle-orm";
import { userPoints, bets, markets, answers } from "@lib/schema";
import { Header } from "@/apps/next-app/components/Header";
import RoomInvitations from "@/apps/next-app/components/room-invitations";
import { Suspense } from "react";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/signin");
  }

  // Get user points
  const userPointsRecord = await db.query.userPoints.findFirst({
    where: eq(userPoints.userId, session.user.id),
  });
  const currentUserPoints = userPointsRecord?.points;

  // Get user's bets
  const userBets = await db
    .select()
    .from(bets)
    .where(eq(bets.userId, session.user.id))
    .leftJoin(markets, eq(bets.marketId, markets.id))
    .innerJoin(answers, eq(bets.answerId, answers.id))
    .orderBy(bets.createdAt);

  // Calculate stats
  const totalBets = userBets.length;
  const resolvedBets = userBets.filter((bet) => bet.markets?.resolvedAnswer);
  const wonBets = resolvedBets.filter(
    (bet) => bet.bets.answerId === bet.markets?.resolvedAnswer
  );
  const winRate =
    resolvedBets.length > 0
      ? Math.round((wonBets.length / resolvedBets.length) * 100)
      : 0;

  const initials =
    session.user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-4">
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <Button variant="ghost" asChild className="mb-6">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Rooms
              </Link>
            </Button>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Profile Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="bg-primary text-3xl text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <h2 className="text-2xl font-bold">
                        {session.user.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
                      <div className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-primary" />
                        <span className="font-medium">Points</span>
                      </div>
                      <span className="text-2xl font-bold">
                        {currentUserPoints}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-secondary p-4 text-center">
                        <TrendingUp className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                        <p className="text-2xl font-bold">{totalBets}</p>
                        <p className="text-xs text-muted-foreground">
                          Total Bets
                        </p>
                      </div>
                      <div className="rounded-lg bg-secondary p-4 text-center">
                        <Trophy className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                        <p className="text-2xl font-bold">{winRate}%</p>
                        <p className="text-xs text-muted-foreground">
                          Win Rate
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Suspense fallback={<div>loading invites...</div>}>
                    <RoomInvitations />
                  </Suspense>
                </CardContent>
              </Card>

              {/* Betting History */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Betting History</CardTitle>
                </CardHeader>
                <CardContent>
                  {userBets.length === 0 ? (
                    <p className="text-center text-muted-foreground">
                      No bets placed yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {userBets.map((bet) => (
                        <Link
                          key={bet.bets.id}
                          href={`/market/${bet.bets.marketId}`}
                          className="block rounded-lg border border-border p-4 transition-colors hover:border-primary/50"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-medium line-clamp-1">
                                {bet.markets?.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {bet.bets.createdAt &&
                                  new Date(
                                    bet.bets.createdAt
                                  ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge
                                variant="default"
                                className="min-w-[50px] justify-center"
                              >
                                {bet.answers.title}
                              </Badge>
                              {bet.markets?.resolvedAnswer && (
                                <Badge
                                  variant="secondary"
                                  className="min-w-[60px] justify-center"
                                >
                                  {bet.bets.answerId ===
                                  bet.markets?.resolvedAnswer
                                    ? "WON"
                                    : "LOST"}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
