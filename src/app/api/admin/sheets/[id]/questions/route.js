export const runtime = "nodejs";

import { auth } from "../../../../../../auth";
import prisma from "../../../../../../lib/prisma";

export async function POST(request, { params }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { questionId } = await request.json();
  const sheetId = (await params).id;
  if (!questionId) return Response.json({ error: "Question is required" }, { status: 400 });

  const relation = await prisma.sheetQuestion.upsert({
    where: { sheetId_questionId: { sheetId, questionId } },
    update: {},
    create: { sheetId, questionId },
  });
  return Response.json({ success: true, relation }, { status: 201 });
}

export async function DELETE(request, { params }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { questionId } = await request.json();
  const sheetId = (await params).id;
  if (!questionId) return Response.json({ error: "Question is required" }, { status: 400 });

  await prisma.sheetQuestion.delete({ where: { sheetId_questionId: { sheetId, questionId } } });
  return Response.json({ success: true });
}
