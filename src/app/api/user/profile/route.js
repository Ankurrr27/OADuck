import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";

export async function PUT(req) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { username, name, image, password } = await req.json();

    const updateData = {};

    if (username) {
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing && existing.email !== session.user.email) {
        return NextResponse.json({ message: "Username already taken" }, { status: 409 });
      }
      updateData.username = username;
    }

    if (name) updateData.name = name;
    if (image !== undefined) updateData.image = image; // Allow null to remove image

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });

    return NextResponse.json({ message: "Profile updated successfully", user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
