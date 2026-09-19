export const runtime = "nodejs";

import { auth } from "../../../auth";
import prisma from "../../../lib/prisma";
import { hash } from "bcryptjs";

const MAX_IMAGE_SIZE = 7 * 1024 * 1024;
const IMAGE_PATTERN = /^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/;

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { name: true, email: true, image: true, username: true, description: true },
  });

  return Response.json({ user });
}

export async function PUT(request) {
  const session = await auth();

  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const image = typeof body.image === "string" ? body.image : null;
  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : undefined;
  const password = typeof body.password === "string" ? body.password : undefined;
  const description = typeof body.description === "string" ? body.description.trim() : "";

  if (!name || name.length > 100) {
    return Response.json({ error: "Name must be between 1 and 100 characters." }, { status: 400 });
  }

  if (description.length > 180) {
    return Response.json({ error: "Bio must be 180 characters or fewer." }, { status: 400 });
  }

  if (image) {
    const isUrl = image.startsWith("http://") || image.startsWith("https://");
    if (!isUrl) {
      if (image.length > MAX_IMAGE_SIZE || !IMAGE_PATTERN.test(image)) {
        return Response.json({ error: "Profile image must be a PNG, JPG, or WEBP under 5 MB." }, { status: 400 });
      }
    } else if (image.length > 2048) {
        return Response.json({ error: "Image URL is too long." }, { status: 400 });
    }
  }

  if (username !== undefined && !/^[a-z0-9_]{3,30}$/.test(username)) {
    return Response.json({ error: "Username must be 3-30 characters using letters, numbers, or underscores." }, { status: 400 });
  }

  if (password !== undefined && (password.length < 8 || password.length > 128)) {
    return Response.json({ error: "Password must be between 8 and 128 characters." }, { status: 400 });
  }

  if (username) {
    const existingUser = await prisma.user.findFirst({
      where: { username, email: { not: session.user.email } },
    });
    if (existingUser) {
      return Response.json({ error: "That username is already taken." }, { status: 409 });
    }
  }

  const updateData = { name, image, description: description || null };
  if (username) updateData.username = username;
  if (password) updateData.passwordHash = await hash(password, 12);

  try {
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: { name: true, image: true, username: true, description: true },
    });

    return Response.json({ user });
  } catch (error) {
    if (error.code === "P2002") {
      return Response.json({ error: "That username is already taken." }, { status: 409 });
    }
    throw error;
  }
}
