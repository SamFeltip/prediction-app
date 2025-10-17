import InviteUserForm from "@/components/invite-user-form";

export default function RoomDetailPage({ params }: { params: { id: string } }) {
  const roomId = Number(params.id);
  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Room {roomId}</h2>
      <InviteUserForm roomId={roomId} />
      <div className="mt-8">Markets for this room will be listed here.</div>
    </div>
  );
}
