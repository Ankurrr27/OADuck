export const runtime = "nodejs";

import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

export async function GET() {
  if (!(await requireAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const sheets = await prisma.sheet.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      createdBy: { select: { name: true, email: true } },
      sheetQuestions: {
        orderBy: { question: { questionNumber: "asc" } },
        select: { question: { select: { id: true, questionNumber: true, title: true } } },
      },
    },
  });

  return Response.json({ success: true, sheets });
}

export async function POST(request) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await request.json();
  if (!name?.trim()) return Response.json({ error: "Sheet name is required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const sheet = await prisma.sheet.create({
    data: { name: name.trim(), createdById: user.id },
    select: { id: true, name: true },
  });
  return Response.json({ success: true, sheet }, { status: 201 });
}
