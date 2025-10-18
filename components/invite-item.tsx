"use client";

import { rooms } from "@/lib/schema";
import { InferSelectModel } from "drizzle-orm";
import { Check, Cross, X } from "lucide-react";
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
      <div className="flex gap-2">
        <button
          className="bg-green-600 text-white px-3 py-1 rounded"
          disabled={actionLoading === invite.id}
          onClick={() => handleAction(invite.id, "accept")}
        >
          <span className="inline-block lg:hidden">Accept</span>
          <span className="hidden lg:inline-block">
            <Check className="inline-block h-4 w-4" />
          </span>
        </button>
        <button
          className="bg-red-600 text-white px-3 py-1 rounded"
          disabled={actionLoading === invite.id}
          onClick={() => handleAction(invite.id, "deny")}
        >
          <span className="inline-block lg:hidden">Deny</span>
          <span className="hidden lg:inline-block">
            <X className="inline-block h-4 w-4" />
          </span>
        </button>
      </div>
    </>
  );
}
