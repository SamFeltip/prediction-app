import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { user, userRooms } from "@/lib/schema";
import { eq, like } from "drizzle-orm";
import { NextResponse } from "next/server";

// POST: invite a user to a room
export async function POST(req: Request) {
  console.log("post invite");
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { roomId, userName } = await req.json();
  const roomIdNum = Number(roomId);

  if (isNaN(roomIdNum))
    return NextResponse.json(
      { error: "Invalid room or user id" },
      { status: 401 }
    );
  // Insert invitation (pending)

  const userResult = await db
    .select()
    .from(user)
    .where(like(user.name, userName));
  if (userResult.length === 0) {
    return NextResponse.json({ error: "User does not exist" }, { status: 400 });
  }

  const invitedUser = userResult[0];

  const userRoomResult = await db
    .select()
    .from(userRooms)
    .where(eq(userRooms.userId, invitedUser.id));
  if (userRoomResult.length > 0) {
    const userRoom = userRoomResult[0];

    if (userRoom.status === "pending") {
      return NextResponse.json(
        { error: "User has already been invited" },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { error: "User is already in room" },
        { status: 400 }
      );
    }
  }

  await db
    .insert(userRooms)
    .values({ roomId: roomIdNum, userId: invitedUser.id, status: "pending" });
  return NextResponse.json({ message: "User invited" }, { status: 201 });
}
