// Room detail page: shows all markets for a room
export default function RoomDetailPage({ params }: { params: { id: string } }) {
  // ...fetch and display markets for this room
  return <div>Room {params.id} (markets will be listed here)</div>;
}
