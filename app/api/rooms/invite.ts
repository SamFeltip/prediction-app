import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { userRooms } from "@/lib/schema";

// POST: invite a user to a room
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { roomId, userId } = await req.json();
  const roomIdNum = Number(roomId);
  const userIdNum = Number(userId);
  if (isNaN(roomIdNum) || isNaN(userIdNum))
    return new Response("Invalid room or user id", { status: 400 });
  // Insert invitation (pending)
  await db
    .insert(userRooms)
    .values({ roomId: roomIdNum, userId: userIdNum, status: "pending" });
  return new Response("User invited", { status: 201 });
}
