export const runtime = "nodejs";

import prisma from "../../../../lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim().toLowerCase();

  if (!username) {
    return Response.json({ error: "Username is required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { username },
    select: { name: true, username: true, image: true, role: true, description: true },
  });

  if (!user) {
    return Response.json({ error: "User not found." }, { status: 404 });
  }

  return Response.json({ user });
}
