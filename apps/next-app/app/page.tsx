import { Suspense } from "react";
import { Header } from "@/apps/next-app/components/Header";
import RoomList from "@/apps/next-app/components/room-list";
import { CreateRoomButton } from "@/apps/next-app/components/create-room-button";
import { Main } from "../components/main";

export default function HomePage() {
  return (
    <>
      <Header />
      <Main>
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
      </Main>
    </>
  );
}
