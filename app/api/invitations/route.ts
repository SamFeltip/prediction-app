import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { userRooms, rooms } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

// GET: list invitations for current user
export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });
  const userId = Number(session.user.id);
  if (isNaN(userId)) return new Response("Invalid user id", { status: 400 });
  // List pending invitations
  const invites = await db
    .select({ invite: userRooms, room: rooms })
    .from(userRooms)
    .where(and(eq(userRooms.userId, userId), eq(userRooms.status, "pending")))
    .leftJoin(rooms, eq(userRooms.roomId, rooms.id));
  return Response.json(invites);
}

// POST: accept/deny invitation
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });
  const userId = Number(session.user.id);
  if (isNaN(userId)) return new Response("Invalid user id", { status: 400 });
  const { inviteId, action } = await req.json();
  if (!inviteId || !["accept", "deny"].includes(action))
    return new Response("Invalid request", { status: 400 });
  // Only "accepted" and "pending" are valid; for deny, delete the invite
  if (action === "accept") {
    await db
      .update(userRooms)
      .set({ status: "accepted" })
      .where(and(eq(userRooms.id, inviteId), eq(userRooms.userId, userId)));
  } else {
    await db
      .delete(userRooms)
      .where(and(eq(userRooms.id, inviteId), eq(userRooms.userId, userId)));
  }
  return new Response("Invitation updated", { status: 200 });
}
