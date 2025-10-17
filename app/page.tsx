import { Suspense } from "react";
import { Header } from "@/components/Header";
import RoomList from "@/components/room-list";
import { CreateRoomButton } from "@/components/create-room-button";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <div className="max-w-2xl mx-auto mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Your Rooms</h2>
            <CreateRoomButton />
          </div>
          <Suspense
            fallback={
              <div className="text-muted-foreground">Loading rooms...</div>
            }
          >
            <RoomList />
          </Suspense>
        </div>
      </main>
    </>
  );
}
