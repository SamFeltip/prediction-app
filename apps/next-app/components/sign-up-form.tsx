import type React from "react";

import { useState } from "react";
import { Button } from "@/apps/next-app/components/ui/button";
import { Input } from "@/apps/next-app/components/ui/input";
import { Label } from "@/apps/next-app/components/ui/label";
import { redirect } from "next/navigation";
import { auth } from "../lib/auth";

export function SignUpForm() {
  async function handleSubmit(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await auth.api.signUpEmail({
        body: { email, password, name },
      });

      formData.append("userId", res.user.id || "");

      const workerUrl = new URL("/upload", process.env.NEXT_PUBLIC_WORKERS_URL);
      const imgResult = await fetch(workerUrl.toString(), {
        method: "POST",
        body: formData,
      });
      console.debug("Image upload response:", imgResult);
    } catch (err) {
      console.error("Sign-up error:", err);
    }

    redirect("/verify");
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="profile">Profile pic</Label>
          <Input
            id="profile"
            name="profile"
            type="file"
            autoComplete="profile"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="John Doe"
          />
        </div>

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
            autoComplete="new-password"
            required
            placeholder="••••••••"
            minLength={8}
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        Create account
      </Button>
    </form>
  );
}
