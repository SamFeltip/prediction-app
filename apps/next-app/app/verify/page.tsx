import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/apps/next-app/components/ui/card";
import { Button } from "@/apps/next-app/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md text-center p-6">
        <CardHeader>
          <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>
            We've sent a verification email to your inbox. Please click the link
            in the email to complete your signup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link className="mt-4 w-full" href={"/auth/signin"}>
            Back to Login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
