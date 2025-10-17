// POST: create a new room
// GET: list all rooms for the current user
export async function POST(req: Request) {
  // ...create room logic
  return new Response("Room created", { status: 201 });
}

export async function GET(req: Request) {
  // ...list rooms for user
  return new Response("Rooms list", { status: 200 });
}
