"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/apps/next-app/lib/auth-client";
import { Button } from "@/apps/next-app/components/ui/button";
import { Input } from "@/apps/next-app/components/ui/input";
import { Label } from "@/apps/next-app/components/ui/label";

export function SignInForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signIn.email(
        {
          email,
          password,
        },
        {
          onError: (ctx) => {
            console.error(ctx.error);
            if (ctx.error.status === 403) {
              setError("Please verify your email address");
            } else {
              setError("Invalid email or password");
            }
            setLoading(false);
          },
          onSuccess: () => {
            setLoading(false);
            router.push("/");
            router.refresh();
          },
        }
      );
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
