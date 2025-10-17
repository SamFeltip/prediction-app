// GET: list invitations for current user
// POST: accept/deny invitation
export async function GET(req: Request) {
  // ...list invitations
  return new Response("Invitations list", { status: 200 });
}

export async function POST(req: Request) {
  // ...accept/deny invitation
  return new Response("Invitation updated", { status: 200 });
}
