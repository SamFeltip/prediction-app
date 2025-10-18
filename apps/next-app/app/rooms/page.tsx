import { CreateRoomButton } from "@/apps/next-app/components/create-room-button";
import { Header } from "@/apps/next-app/components/Header";
import RoomList from "@/apps/next-app/components/room-list";

export default function RoomsPage() {
  return (
    <>
      <Header />
      <main>
        <div className="max-w-2xl mx-auto mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Your Rooms</h2>
            <CreateRoomButton />
          </div>
          <RoomList />
        </div>
      </main>
    </>
  );
}
