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
      console.log("url: ", url);
      console.log("request url: ", request?.url);

      if (user.email.indexOf("@example.com") !== -1) {
        console.log("Sending email to test email, instead of:", user.email);
        await sendSingupEmail({
          name: user.name || "Test User",
          id: user.id,
          email: "sf.samfelton@icloud.com",
          token,
        });

        return;
      } else {
        await sendSingupEmail({
          name: user.name,
          id: user.id,
          email: user.email,
          token,
        });
      }
    },
  },
});

export type Session = typeof auth.$Infer.Session;
