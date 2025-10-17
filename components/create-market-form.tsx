"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth-client";

interface CreateMarketFormProps {
  onSuccess?: () => void;
  roomId: number;
}

interface AnswerOption {
  id: number;
  title: string;
}

export function CreateMarketForm({ onSuccess, roomId }: CreateMarketFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<AnswerOption[]>([
    { id: 1, title: "" },
    { id: 2, title: "" },
  ]);
  const [nextAnswerId, setNextAnswerId] = useState(3);

  function handleAnswerChange(index: number, value: string) {
    setAnswers((prev) =>
      prev.map((a, i) => (i === index ? { ...a, title: value } : a))
    );
  }

  function handleAddAnswer() {
    const s = setAnswers((prev) => [...prev, { id: nextAnswerId, title: "" }]);
    console.log({ answers });
    setNextAnswerId((id) => id + 1);
  }

  function handleRemoveAnswer(index: number) {
    setAnswers((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const deadline = formData.get("deadline") as string;

    // Validate answers
    const trimmedAnswers = answers
      .filter((a) => a.title !== "")
      .map((a) => a.title.trim())
      .filter(Boolean);
    if (trimmedAnswers.length < 2) {
      setError("Please provide at least two answer options.");
      setLoading(false);
      return;
    }

    try {
      const body = {
        title,
        description,
        roomId,
        deadline: new Date(deadline).toISOString(),
        answers: trimmedAnswers.map((title) => ({ title })),
      };

      const response = await fetch("/api/markets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create wager");
      }

      router.push(`/market/${data.market.id}`);
      router.refresh();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!session) {
    return (
      <div className="text-muted-foreground">
        Please sign in to create a market.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Wager</Label>
        <Input
          id="title"
          name="title"
          placeholder="Will Trump have a third term?"
          required
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Add context or resolution criteria..."
          rows={3}
          maxLength={1000}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="deadline">Resolution Deadline</Label>
        <Input
          id="deadline"
          name="deadline"
          type="datetime-local"
          required
          min={new Date().toISOString().slice(0, 14)}
        />
      </div>

      <div className="space-y-2">
        <Label>Answer Options</Label>
        <div className="space-y-2">
          {answers.map((answer, idx) => (
            <div key={answer.id} className="flex items-center gap-2">
              <Input
                type="text"
                placeholder={`Option ${idx + 1}`}
                value={answer.title}
                onChange={(e) => handleAnswerChange(idx, e.target.value)}
                required
                maxLength={100}
                className="flex-1"
              />
              {answers.length > 2 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveAnswer(idx)}
                  aria-label="Remove option"
                >
                  &times;
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={handleAddAnswer}
          className="mt-2"
        >
          Add Option
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating..." : "Create Market"}
      </Button>
    </form>
  );
}
