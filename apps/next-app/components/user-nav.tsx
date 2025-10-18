import { useSession } from "@/apps/next-app/lib/auth-client";
import { Button } from "@/apps/next-app/components/ui/button";
import Link from "next/link";
import { UserDropdown } from "./user-dropdown";
import { headers } from "next/headers";
import { auth } from "@/apps/next-app/lib/auth";
import { db } from "@/apps/next-app/lib/db";
import { userRooms } from "@lib/schema";
import { count } from "console";
import { and, eq } from "drizzle-orm";

export async function UserNav() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href="/auth/signin">Sign In</Link>
        </Button>
        <Button asChild>
          <Link href="/auth/signup">Sign Up</Link>
        </Button>
      </div>
    );
  }

  const inviteCountResult = await db
    .select()
    .from(userRooms)
    .where(
      and(
        eq(userRooms.userId, session.user.id),
        eq(userRooms.status, "pending")
      )
    );
  const inviteCount = inviteCountResult.length;

  const initials =
    session.user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <UserDropdown user={session.user} initials={initials} count={inviteCount} />
  );
}
