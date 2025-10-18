import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/apps/next-app/lib/db";
import { sendSingupEmail } from "./email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,

    sendVerificationEmail: async ({ user, url, token }, request) => {
      if (user.email.indexOf("@example.com") !== -1) {
        console.log("Sending email to test email, instead of:", user.email);

        await sendSingupEmail({
          name: user.name || "Test User",
          id: user.id,
          email: "sf.samfelton@icloud.com",
          url,
          token,
          request,
        });

        return;
      }

      await sendSingupEmail({
        name: user.name,
        id: user.id,
        email: user.email,
        url,
        token,
        request,
      });
    },
  },
});

export type Session = typeof auth.$Infer.Session;
