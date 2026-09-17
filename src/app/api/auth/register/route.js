export const runtime = "nodejs";

import { hash } from "bcryptjs";
import prisma from "../../../../lib/prisma";

export async function POST(request) {
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!name || name.length > 100) {
    return Response.json({ error: "Enter a name between 1 and 100 characters." }, { status: 400 });
  }

  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    return Response.json({ error: "Username must be 3-30 characters using letters, numbers, or underscores." }, { status: 400 });
  }

  if (!email || !email.includes("@")) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (password.length < 8 || password.length > 128) {
    return Response.json({ error: "Password must be between 8 and 128 characters." }, { status: 400 });
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
    select: { email: true, username: true },
  });

  if (existingUser?.email === email) {
    return Response.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  if (existingUser?.username === username) {
    return Response.json({ error: "That username is already taken." }, { status: 409 });
  }

  const isAdmin = email === process.env.AUTH_ADMIN_EMAIL?.trim().toLowerCase();
  const passwordHash = await hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      name,
      username,
      passwordHash,
      role: isAdmin ? "ADMIN" : "USER",
    },
  });

  return Response.json({ ok: true }, { status: 201 });
}
