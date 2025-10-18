"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/apps/next-app/components/ui/card";
import { Button } from "@/apps/next-app/components/ui/button";
import { Label } from "@/apps/next-app/components/ui/label";
import { useSession } from "@/apps/next-app/lib/auth-client";
import { Coins } from "lucide-react";
import useSWR from "swr";
import { InferSelectModel } from "drizzle-orm";
import { markets } from "@/apps/next-app/lib/schema";
import { MarketWithBets } from "@/apps/next-app/lib/betting/betCounts";

export function BettingInterface({ market }: { market: MarketWithBets }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isExpired = new Date(market.deadline) < new Date();
  const canBet = !market.resolvedAnswer && !isExpired && session;

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
          answerId: prediction,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setPrediction(null);
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

  if (market.resolvedAnswer) {
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
        {/* Prediction Selection */}
        <div className="space-y-2">
          <Label>Your Prediction</Label>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(market.answers).map((answer) => (
              <Button
                key={answer.id}
                variant={prediction === answer.id ? "default" : "outline"}
                onClick={() => setPrediction(answer.id)}
              >
                {answer.title}
              </Button>
            ))}
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
