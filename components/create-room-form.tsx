// Create a new room page
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateRoomForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.push("/rooms");
    } catch (err: any) {
      setError(err.message || "Failed to create room");
    } finally {
      setLoading(false);
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        className="w-full border rounded px-3 py-2"
        placeholder="Room title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <button
        type="submit"
        className="bg-primary text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Room"}
      </button>
      {error && <div className="text-red-500">{error}</div>}
    </form>
  );
}
