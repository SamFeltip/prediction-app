// Form to invite a user to a room by user ID
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function InviteUserForm({ roomId }: { roomId: number }) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, userEmail: userEmail }),
      });
      const message = await res.json();
      console.log({ message });
      if (!res.ok) throw new Error(message.error);

      setSuccess("User invited!");
      setUserEmail("");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to invite user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <input
        type="text"
        className="border rounded px-2 py-1"
        placeholder="User email to invite"
        value={userEmail}
        onChange={(e) => setUserEmail(e.target.value)}
        required
      />
      <button
        type="submit"
        className="bg-primary text-white px-3 py-1 rounded"
        disabled={loading}
      >
        {loading ? "Inviting..." : "Invite"}
      </button>
      {error && <span className="text-red-500 ml-2">{error}</span>}
      {success && <span className="text-green-600 ml-2">{success}</span>}
    </form>
  );
}
