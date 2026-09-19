export const runtime = "nodejs";

import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const question = await prisma.question.findUnique({
      where: { id },
      select: {
        id: true,
        questionNumber: true,
        title: true,
        description: true,
        difficulty: true,
        topics: true,
        examples: true,
        constraints: true,
        source: true,
        sourceUrl: true,
        leetcodeSlug: true,
        leetcodeId: true,
      },
    });

    if (!question) {
      return Response.json({ error: "Question not found" }, { status: 404 });
    }

    return Response.json({ success: true, question });
  } catch (error) {
    console.error("Error fetching question:", error);
    return Response.json({ success: false, error: "Failed to fetch question" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      difficulty,
      topics,
      examples,
      constraints,
      source,
      sourceUrl,
      leetcodeSlug,
      leetcodeId,
    } = body;

    if (!title || !difficulty) {
      return Response.json({ error: "Title and difficulty are required" }, { status: 400 });
    }

    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) {
      return Response.json({ error: "Question not found" }, { status: 404 });
    }

    const question = await prisma.question.update({
      where: { id },
      data: {
        title,
        description,
        difficulty,
        topics: topics || [],
        examples: examples || [],
        constraints: constraints || [],
        source: source || existing.source,
        sourceUrl,
        leetcodeSlug,
        leetcodeId,
      },
    });

    return Response.json({ success: true, question });
  } catch (error) {
    console.error("Error updating question:", error);
    return Response.json({ success: false, error: "Failed to update question" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) {
      return Response.json({ error: "Question not found" }, { status: 404 });
    }

    await prisma.question.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting question:", error);
    return Response.json({ success: false, error: "Failed to delete question" }, { status: 500 });
  }
}
