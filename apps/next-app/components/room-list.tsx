import Link from "next/link";
import { db } from "@/apps/next-app/lib/db";
import { auth } from "@/apps/next-app/lib/auth";
import { userRooms, rooms, user } from "@lib/schema";
import { eq, and, InferSelectModel } from "drizzle-orm";

import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getInitials } from "../lib/getInitials";

export default async function RoomList() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return <div className="text-red-500">Not signed in</div>;

  const userId = session.user.id;

  const roomResults = await db
    .select({
      room: rooms,
      userRoom: userRooms,
      users: user,
    })
    .from(userRooms)
    .where(eq(userRooms.status, "accepted"))
    .innerJoin(rooms, eq(userRooms.roomId, rooms.id))
    .innerJoin(user, eq(userRooms.userId, user.id));

  const roomsWithUsers: Record<
    string,
    {
      room: InferSelectModel<typeof rooms>;
      users: InferSelectModel<typeof user>[];
    }
  > = {};

  roomResults.forEach((row) => {
    roomsWithUsers[row.room.id] = roomsWithUsers[row.room.id] || {
      room: row.room,
      users: [],
    };

    roomsWithUsers[row.room.id].users.push(row.users);
  });

  Object.keys(roomsWithUsers).forEach((roomId) => {
    if (!roomsWithUsers[roomId].users.some((u) => u.id === userId)) {
      delete roomsWithUsers[roomId];
    }
  });

  if (Object.values(roomsWithUsers).length == 0) {
    return <div>No rooms found.</div>;
  }

  return (
    <>
      <ul className="space-y-2">
        {Object.values(roomsWithUsers).map((room) => (
          <li key={room.room.id}>
            <Card className=" transition-colors hover:border-primary/50">
              <CardHeader>
                <CardTitle>{room.room.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2">
                  {room.users.map((userObj) => (
                    <Avatar key={`${room.room.id}/${userObj.id}`}>
                      <AvatarImage
                        src={userObj.image || undefined}
                        alt={userObj.name || "user Avatar"}
                      />
                      <AvatarFallback>
                        {getInitials(userObj.name)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button asChild>
                    <Link
                      href={`/rooms/${room.room.id}`}
                      className="text-blue-600"
                    >
                      visit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
