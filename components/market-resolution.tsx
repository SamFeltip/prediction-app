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
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { markets } from "@/lib/schema";
import { InferSelectModel } from "drizzle-orm";
import { MarketWithBets } from "@/lib/betting/betCounts";

export function MarketResolution({ market }: { market: MarketWithBets }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isCreator = session?.user.id === market.creatorId;
  const isExpired = new Date(market.deadline) < new Date();
  const answer = market.resolvedAnswer && market.answers[market.resolvedAnswer];

  async function handleResolve(outcome: boolean) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/markets/${market.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to resolve market");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!isCreator) {
    return null;
  }

  if (answer) {
    return (
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Wager Resolved
          </CardTitle>
          <CardDescription>
            This wager has been resolved as <strong>{answer.title}</strong>
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!isExpired) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            Resolution Pending
          </CardTitle>
          <CardDescription>
            You can resolve this market after the deadline passes on{" "}
            {new Date(market.deadline).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <CardTitle>Resolve Market</CardTitle>
        <CardDescription>
          The deadline has passed. As the creator, you must decide the outcome
          of this market.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">
            Choose the correct outcome. Winners will receive points equal to the
            total points staked by losers.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            size="lg"
            className="h-20 bg-accent hover:bg-accent/90"
            onClick={() => handleResolve(true)}
            disabled={loading}
          >
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              <span className="text-lg font-bold">YES</span>
            </div>
          </Button>

          <Button
            size="lg"
            variant="destructive"
            className="h-20"
            onClick={() => handleResolve(false)}
            disabled={loading}
          >
            <div className="flex flex-col items-center gap-2">
              <XCircle className="h-6 w-6" />
              <span className="text-lg font-bold">NO</span>
            </div>
          </Button>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
