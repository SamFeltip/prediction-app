import { SignUpForm } from "@/apps/next-app/components/sign-up-form";
import { TrendingUp } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-2xl font-bold"
          >
            <img src="/frame.png" className="h-9 w-9" />
            Predict
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}
