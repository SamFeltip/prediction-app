import { db } from "@/apps/next-app/lib/db";
import { markets } from "@lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/apps/next-app/lib/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const marketId = Number.parseInt(params.id);
  if (isNaN(marketId)) {
    return new Response("Invalid market ID", { status: 400 });
  }

  const market = await db.query.markets.findFirst({
    where: eq(markets.id, marketId),
  });

  if (market?.creatorId !== session.user.id) {
    return new Response("Forbidden", { status: 403 });
  }

  const { title, description } = await request.json();

  await db
    .update(markets)
    .set({ title, description })
    .where(eq(markets.id, marketId));

  return new Response("OK", { status: 200 });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const marketId = Number.parseInt(params.id);
  if (isNaN(marketId)) {
    return new Response("Invalid market ID", { status: 400 });
  }

  const market = await db.query.markets.findFirst({
    where: eq(markets.id, marketId),
  });

  if (market?.creatorId !== session.user.id) {
    return new Response("Forbidden", { status: 403 });
  }

  await db.delete(markets).where(eq(markets.id, marketId));

  return new Response("OK", { status: 200 });
}
