import { db } from "@/apps/next-app/lib/db";
import { auth } from "@/apps/next-app/lib/auth";
import { rooms, user, userRooms } from "@/apps/packages/lib/schema";
import { eq, like, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { sendInviteEmail } from "@/apps/next-app/lib/email";

// POST: invite a user to a room
export async function POST(req: Request) {
  console.log("post invite");
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    console.error("no session");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { roomId, userEmail } = await req.json();
  const roomIdNum = Number(roomId);

  console.debug({ roomIdNum, userEmail });

  if (isNaN(roomIdNum)) {
    console.error("invalid room id");
    return NextResponse.json(
      { error: "Invalid room or user id" },
      { status: 401 }
    );
  }

  // Insert invitation (pending)
  console.debug("checking room exists");

  const roomResult = await db
    .select()
    .from(rooms)
    .where(eq(rooms.id, roomIdNum));
  if (roomResult.length === 0) {
    console.error("room does not exist");
    return NextResponse.json({ error: "Room does not exist" }, { status: 400 });
  }

  console.debug("checking user exists");

  const userResult = await db
    .select()
    .from(user)
    .where(like(user.email, userEmail));
  if (userResult.length === 0) {
    console.error("user does not exist");
    return NextResponse.json({ error: "User does not exist" }, { status: 400 });
  }

  const invitedUser = userResult[0];

  console.debug("user exists", { invitedUser });

  console.debug("checking user not already invited or in room");

  const userRoomResult = await db
    .select()
    .from(userRooms)
    .where(
      and(eq(userRooms.roomId, roomId), eq(userRooms.userId, invitedUser.id))
    );
  if (userRoomResult.length > 0) {
    const userRoom = userRoomResult[0];

    console.debug("userRoom found:", { userRoom });

    if (userRoom.status === "pending") {
      console.error("user has already been invited");
      return NextResponse.json(
        { error: "User has already been invited" },
        { status: 400 }
      );
    } else {
      console.error("user is already in room");
      return NextResponse.json(
        { error: "User is already in room" },
        { status: 400 }
      );
    }
  }

  const newUserRoomResult = await db
    .insert(userRooms)
    .values({ roomId: roomIdNum, userId: invitedUser.id, status: "pending" })
    .returning();

  const newUserRoom = newUserRoomResult[0];

  const roomUrl = new URL(
    `/api/invites/${newUserRoom.id}/accept`,
    req.url
  ).toString();

  let inviteEmailUser = invitedUser;
  if (invitedUser.email.indexOf("@example.com") !== -1) {
    inviteEmailUser.email = "sf.samfelton@icloud.com";
  }

  await sendInviteEmail({
    user: inviteEmailUser,
    room: roomResult[0],
    url: roomUrl,
  });

  return NextResponse.json({ message: "User invited" }, { status: 201 });
}
