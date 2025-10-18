import { CreateMarketButton } from "@/apps/next-app/components/create-market-button";
import { Header } from "@/apps/next-app/components/Header";
import InviteUserForm from "@/apps/next-app/components/invite-user-form";
import { MarketList } from "@/apps/next-app/components/market-list";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/apps/next-app/components/ui/avatar";
import { auth } from "@/apps/next-app/lib/auth";
import { db } from "@/apps/next-app/lib/db";
import { getInitials } from "@/apps/next-app/lib/getInitials";
import { rooms, user, userRooms } from "@lib/schema";
import { eq, and } from "drizzle-orm";

import { headers } from "next/headers";
import { Suspense } from "react";

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const roomId = Number(id);
  if (roomId === undefined || isNaN(roomId)) {
    throw new Error("room id is invalid");
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("user not authenticated");
  }

  const roomResult = await db
    .select()
    .from(rooms)
    .innerJoin(userRooms, eq(rooms.id, userRooms.roomId))
    .where(and(eq(rooms.id, roomId), eq(userRooms.userId, session.user.id)));

  if (roomResult.length == 0) {
    throw new Error("room could not be found");
  }

  const { rooms: r } = roomResult[0];

  const userRoomResult = await db
    .select()
    .from(userRooms)
    .innerJoin(user, eq(user.id, userRooms.userId))
    .where(eq(userRooms.roomId, roomId));
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-4">
        <div className="max-w-2xl mx-auto md:mt-10 flex flex-col gap-2">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold mb-4">{r.title}</h2>
            <CreateMarketButton roomId={roomId} />
          </div>

          <div className="flex flex-col md:flex-row gap-3 justify-between mb-4">
            <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2">
              {userRoomResult.map((userRoom) => (
                <Avatar
                  key={userRoom.userRooms.id}
                  className={
                    userRoom.userRooms.status === "pending" ? "grayscale" : ""
                  }
                >
                  <AvatarImage
                    src={userRoom.user.image || undefined}
                    alt={userRoom.user.name || "User Avatar"}
                  />
                  <AvatarFallback>
                    {getInitials(userRoom.user.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>

            <InviteUserForm roomId={roomId} />
          </div>
          <Suspense fallback={<div>Loading wagers...</div>}>
            <MarketList roomId={roomId} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
