export const runtime = "nodejs";

import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma";

export async function POST(request) {
  try {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return Response.json({ error: "No user found with that email address." }, { status: 404 });
    }

    if (user.role === "ADMIN") {
      return Response.json({ error: "User is already an Administrator." }, { status: 400 });
    }

    // Promote to ADMIN
    await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error promoting user:", error);
    return Response.json({ success: false, error: "Failed to promote user" }, { status: 500 });
  }
}
