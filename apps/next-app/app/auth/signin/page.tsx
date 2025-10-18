import { SignInForm } from "@/apps/next-app/components/sign-in-form";
import { TrendingUp } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-bold"
          >
            <TrendingUp className="h-8 w-8 text-primary" />
            Predict
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Or{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-primary hover:underline"
            >
              create a new account
            </Link>
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
