"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";

/**
 * A button component to submit the create account form, which shows loading while a form action is happening.
 */
export function CreateAccountButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating account..." : "Create account"}
    </Button>
  );
}
