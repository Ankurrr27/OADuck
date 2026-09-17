import { auth } from "../../../auth";
import prisma from "../../../lib/prisma";

const MAX_IMAGE_SIZE = 7 * 1024 * 1024;
const IMAGE_PATTERN = /^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/;

export async function PUT(request) {
  const session = await auth();

  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const image = typeof body.image === "string" ? body.image : null;

  if (!name || name.length > 100) {
    return Response.json({ error: "Name must be between 1 and 100 characters." }, { status: 400 });
  }

  if (image && (image.length > MAX_IMAGE_SIZE || !IMAGE_PATTERN.test(image))) {
    return Response.json({ error: "Profile image must be a PNG, JPG, or WEBP under 5 MB." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: { name, image },
    select: { name: true, image: true },
  });

  return Response.json({ user });
}