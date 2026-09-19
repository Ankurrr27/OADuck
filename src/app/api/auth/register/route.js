import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { email, password, name, username: providedUsername } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 });
    }

    let finalUsername = providedUsername;
    if (!finalUsername) {
      let baseUsername = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'user';
      if (!baseUsername) baseUsername = 'user';
      let isUnique = false;
      finalUsername = baseUsername;
      
      while (!isUnique) {
        const existing = await prisma.user.findUnique({ where: { username: finalUsername } });
        if (!existing) {
          isUnique = true;
        } else {
          finalUsername = `${baseUsername}${Math.floor(Math.random() * 1000)}`;
        }
      }
    } else {
      const existing = await prisma.user.findUnique({ where: { username: finalUsername } });
      if (existing) {
        return NextResponse.json({ message: "Username already taken" }, { status: 409 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const isAdmin = email.toLowerCase() === process.env.AUTH_ADMIN_EMAIL?.toLowerCase();

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        username: finalUsername,
        role: isAdmin ? "ADMIN" : "USER",
      },
    });

    return NextResponse.json({ message: "User created successfully", userId: user.id }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
