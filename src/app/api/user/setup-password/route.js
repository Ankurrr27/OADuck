export const runtime = "nodejs";

import { hash } from "bcryptjs";
import prisma from "../../../../lib/prisma";
import { auth } from "../../../../auth";

export async function POST(request) {
  const session = await auth();

  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.user.needsPasswordSetup) {
    return Response.json({ error: "Password already set up." }, { status: 400 });
  }

  const body = await request.json();
  const password = typeof body.password === "string" ? body.password : "";

  if (password.length < 8 || password.length > 128) {
    return Response.json({ error: "Password must be between 8 and 128 characters." }, { status: 400 });
  }

  const passwordHash = await hash(password, 12);

  await prisma.user.update({
    where: { email: session.user.email },
    data: { passwordHash },
  });

  return Response.json({ ok: true });
}
