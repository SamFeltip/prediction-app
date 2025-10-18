import { db } from "@/apps/next-app/lib/db";
import { auth } from "@/apps/next-app/lib/auth";
import { userRooms } from "@/apps/packages/lib/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// POST: accept/deny invitation
export async function GET(
  req: NextRequest,
  { params }: { params: { inviteId: string } }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const userId = session.user.id;
  console.debug(userId);
  console.debug({ inviteId: params.inviteId, userId: userId });

  const userRoomResponse = await db
    .select()
    .from(userRooms)
    .where(
      and(eq(userRooms.id, params.inviteId), eq(userRooms.userId, userId))
    );
  console.debug(userRoomResponse);

  if (userRoomResponse.length === 0) {
    return new Response("Invitation not found", { status: 404 });
  }

  await db
    .update(userRooms)
    .set({ status: "accepted" })
    .where(
      and(eq(userRooms.id, params.inviteId), eq(userRooms.userId, userId))
    );

  // return redirect to room
  return NextResponse.redirect(
    new URL(`/rooms/${userRoomResponse[0].roomId}`, req.url)
  );
}
