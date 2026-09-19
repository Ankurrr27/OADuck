export const runtime = "nodejs";

import { auth } from "../../../../../auth";
import prisma from "../../../../../lib/prisma";

export async function PUT(request, { params }) {
  try {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { role } = await request.json();

    if (role !== "USER" && role !== "ADMIN") {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }

    // Prevent removing your own admin status directly
    if (session.user.id === id && role === "USER") {
      return Response.json({ error: "Cannot downgrade your own account" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, username: true, role: true },
    });

    return Response.json({ success: true, user });
  } catch (error) {
    console.error("Error updating user role:", error);
    return Response.json({ success: false, error: "Failed to update user role" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Prevent deleting your own account directly
    if (session.user.id === id) {
      return Response.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return Response.json({ success: false, error: "Failed to delete user" }, { status: 500 });
  }
}
