import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { userRooms, rooms } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

import { headers } from "next/headers";

export default async function RoomList() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return <div className="text-red-500">Not signed in</div>;
  const userId = Number(session.user.id);
  if (isNaN(userId)) return <div className="text-red-500">Invalid user id</div>;
  const userRoomRows = await db
    .select({ room: rooms, userRoom: userRooms })
    .from(userRooms)
    .where(and(eq(userRooms.userId, userId), eq(userRooms.status, "accepted")))
    .leftJoin(rooms, eq(userRooms.roomId, rooms.id));
  const roomList = userRoomRows.map((row) => row.room).filter(Boolean);
  if (!roomList.length) return <div>No rooms found.</div>;

  return (
    <ul className="space-y-2">
      {roomList.map((room) => (
        <li key={room!.id}>
          <Link href={`/rooms/${room!.id}`} className="text-blue-600 underline">
            {room!.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
