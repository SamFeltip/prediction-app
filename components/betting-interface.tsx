"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import { Coins } from "lucide-react";
import useSWR from "swr";
import { InferSelectModel } from "drizzle-orm";
import { markets } from "@/lib/schema";

type BettingInterfaceProps = InferSelectModel<typeof markets>;

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function BettingInterface({
  market,
}: {
  market: BettingInterfaceProps;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [prediction, setPrediction] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: pointsData } = useSWR(
    session ? "/api/user/points" : null,
    fetcher,
    {
      refreshInterval: 5000,
    }
  );

  const userPoints = pointsData?.points ?? 0;

  const isExpired = new Date(market.deadline) < new Date();
  const canBet = !market.resolved && !isExpired && session;

  async function handlePlaceBet() {
    if (!session || prediction === null) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketId: market.id,
          prediction,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to place bet");
      }

      // Reset form
      setPrediction(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Place Your Bet</CardTitle>
          <CardDescription>
            Sign in to participate in this market
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            onClick={() => router.push("/auth/signin")}
          >
            Sign In to Bet
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (market.resolved) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wager Resolved</CardTitle>
          <CardDescription>
            This wager has been resolved and betting is closed
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isExpired) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Betting Closed</CardTitle>
          <CardDescription>
            The deadline has passed. Awaiting resolution.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Place Your Bet</CardTitle>
        <CardDescription>
          Choose your prediction and stake points
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* User Points Display */}
        <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            <span className="font-medium">Your Points</span>
          </div>
          <span className="text-2xl font-bold">{userPoints}</span>
        </div>

        {/* Prediction Selection */}
        <div className="space-y-2">
          <Label>Your Prediction</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={prediction === true ? "default" : "outline"}
              className={
                prediction === true ? "bg-accent hover:bg-accent/90" : ""
              }
              onClick={() => setPrediction(true)}
            >
              YES
            </Button>
            <Button
              variant={prediction === false ? "default" : "outline"}
              className={
                prediction === false
                  ? "bg-destructive hover:bg-destructive/90"
                  : ""
              }
              onClick={() => setPrediction(false)}
            >
              NO
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button
          className="w-full"
          onClick={handlePlaceBet}
          disabled={loading || !canBet || prediction === null}
        >
          {loading ? "Placing Bet..." : "Place Bet"}
        </Button>
      </CardContent>
    </Card>
  );
}
