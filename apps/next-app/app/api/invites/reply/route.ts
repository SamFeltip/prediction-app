import { db } from "@/apps/next-app/lib/db";
import { auth } from "@/apps/next-app/lib/auth";
import { userRooms } from "@/apps/packages/lib/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

// POST: accept/deny invitation
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const userId = session.user.id;

  const { inviteId, action } = await req.json();
  if (!inviteId || !["accept", "deny"].includes(action))
    return new Response("Invalid request", { status: 400 });

  const userRoomResponse = await db
    .select()
    .from(userRooms)
    .where(and(eq(userRooms.id, inviteId), eq(userRooms.userId, userId)));

  if (userRoomResponse.length === 0) {
    return new Response("Invitation not found", { status: 404 });
  }

  // Only "accepted" and "pending" are valid; for deny, delete the invite
  if (action === "deny") {
    await db
      .delete(userRooms)
      .where(and(eq(userRooms.id, inviteId), eq(userRooms.userId, userId)));
  } else {
    await db
      .update(userRooms)
      .set({ status: "accepted" })
      .where(and(eq(userRooms.id, inviteId), eq(userRooms.userId, userId)));
  }

  return new Response("Invitation updated", { status: 200 });
}
