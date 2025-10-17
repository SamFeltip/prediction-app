import { CreateMarketButton } from "@/components/create-market-button";
import { Header } from "@/components/Header";
import InviteUserForm from "@/components/invite-user-form";
import { MarketList } from "@/components/market-list";

export default function RoomDetailPage({ params }: { params: { id: string } }) {
  const roomId = Number(params.id);
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-4">
        <div className="max-w-2xl mx-auto mt-10 flex flex-col gap-2">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold mb-4">Room {roomId}</h2>
            <CreateMarketButton />
          </div>

          <div className="flex justify-end">
            <InviteUserForm roomId={roomId} />
          </div>

          <MarketList roomId={roomId} />
        </div>
      </main>
    </>
  );
}
