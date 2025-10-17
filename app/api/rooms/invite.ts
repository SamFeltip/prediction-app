// POST: invite a user to a room
export async function POST(req: Request) {
  // ...invite logic
  return new Response("User invited", { status: 201 });
}
