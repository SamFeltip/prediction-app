"use client";

import { rooms } from "@/lib/schema";
import { InferSelectModel } from "drizzle-orm";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function InviteItem({
  invite,
  room,
}: {
  invite: { id: number };
  room: InferSelectModel<typeof rooms>;
}) {
  const router = useRouter();

  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function handleAction(inviteId: number, action: "accept" | "deny") {
    setActionLoading(inviteId);
    setError("");
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId, action }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update invitation");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <>
      <span>
        Invited to <b>{room.title}</b>
      </span>
      <div className="space-x-2">
        <button
          className="bg-green-600 text-white px-3 py-1 rounded"
          disabled={actionLoading === invite.id}
          onClick={() => handleAction(invite.id, "accept")}
        >
          Accept
        </button>
        <button
          className="bg-red-600 text-white px-3 py-1 rounded"
          disabled={actionLoading === invite.id}
          onClick={() => handleAction(invite.id, "deny")}
        >
          Deny
        </button>
      </div>
    </>
  );
}
