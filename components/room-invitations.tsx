// Component to show and manage invitations in /profile
import { useEffect, useState } from "react";
import { InviteItem } from "./invite-item";
import { db } from "@/lib/db";
import { rooms, userRooms } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export default async function RoomInvitations() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("user not authentication");

  const userId = session.user.id;

  const invites = await db
    .select({ invite: userRooms, room: rooms })
    .from(userRooms)
    .where(and(eq(userRooms.userId, userId), eq(userRooms.status, "pending")))
    .innerJoin(rooms, eq(userRooms.roomId, rooms.id));

  if (!invites.length) return <div>No invitations.</div>;

  return (
    <ul className="space-y-2">
      {invites.map(({ invite, room }) => (
        <li
          key={invite.id}
          className="flex items-center justify-between border rounded p-2"
        >
          <InviteItem invite={invite} room={room} />
        </li>
      ))}
    </ul>
  );
}
