import { NextResponse } from "next/server";
import { db } from "@/apps/next-app/lib/db";
import { auth } from "@/apps/next-app/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { userPoints } from "@/apps/next-app/lib/schema";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db.query.userPoints.findFirst({
      where: eq(userPoints.userId, session.user.id),
    });

    const points = result?.points;

    return NextResponse.json({ points });
  } catch (error) {
    console.error("[v0] Error fetching user points:", error);
    return NextResponse.json(
      { error: "Failed to fetch points" },
      { status: 500 }
    );
  }
}
