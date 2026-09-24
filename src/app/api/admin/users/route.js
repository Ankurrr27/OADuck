export const runtime = "nodejs";

import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
      },
      orderBy: { email: "asc" },
    });

    return Response.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
  }
}
