import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { rooms, userRooms } from "@/lib/schema";

// POST: create a new room
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { title } = await req.json();
  if (!title) return new Response("Missing title", { status: 400 });

  // Create room
  const creatorId = session.user.id;

  const [room] = await db
    .insert(rooms)
    .values({ title, creator: creatorId })
    .returning();
  // Add creator as member (accepted)
  await db
    .insert(userRooms)
    .values({ roomId: room.id, userId: creatorId, status: "accepted" });
  return Response.json(room, { status: 201 });
}

// GET: list all rooms for the current user
export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });
  // Get all rooms where user is a member (accepted)
  const userId = session.user.id;

  const userRoomRows = await db
    .select({ room: rooms, userRoom: userRooms })
    .from(userRooms)
    .where(eq(userRooms.userId, userId))
    .leftJoin(rooms, eq(userRooms.roomId, rooms.id));
  const roomsList = userRoomRows.map((row) => row.room);
  return Response.json(roomsList);
}
