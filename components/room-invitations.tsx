// Component to show and manage invitations in /profile
"use client";
import { useEffect, useState } from "react";

type Invite = {
  invite: { id: number };
  room: { id: number; title: string };
};

export default function RoomInvitations() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/invitations")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then(setInvites)
      .catch(() => setError("Failed to load invitations"))
      .finally(() => setLoading(false));
  }, []);

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
      setInvites(invites.filter((i) => i.invite.id !== inviteId));
    } catch (err: any) {
      setError(err.message || "Failed to update invitation");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return <div>Loading invitations...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!invites.length) return <div>No invitations.</div>;

  return (
    <ul className="space-y-2">
      {invites.map(({ invite, room }) => (
        <li
          key={invite.id}
          className="flex items-center justify-between border rounded p-2"
        >
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
        </li>
      ))}
    </ul>
  );
}
