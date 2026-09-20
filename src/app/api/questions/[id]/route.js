export const runtime = "nodejs";

import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma";

const VALID_SOURCES = new Set(["leetcode", "gfg", "admin"]);

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const session = await auth();
    const canViewHiddenTests = session?.user?.role === "ADMIN";

    const isAdmin = session?.user?.role === "ADMIN";
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
        testCases: {
          where: canViewHiddenTests ? {} : { isSample: true },
          orderBy: { id: "asc" },
          select: { id: true, input: true, expectedOutput: true, isSample: true },
        },
        expectedTC: true,
        expectedSC: true,
        hints: { orderBy: { hintOrder: "asc" }, select: { id: true, hintOrder: true, content: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        ...(isAdmin ? { optimalSolutions: { orderBy: { language: "asc" }, select: { id: true, language: true, code: true } } } : {}),
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
      testCases,
      expectedTC,
      expectedSC,
      hints,
      optimalSolutions,
    } = body;

    const sourceValue = source || "admin";
    if (!title?.trim() || !difficulty?.trim()) {
      return Response.json({ error: "Title and difficulty are required" }, { status: 400 });
    }
    if (!VALID_SOURCES.has(sourceValue)) {
      return Response.json({ error: "Source must be leetcode, gfg, or admin" }, { status: 400 });
    }
    if ((sourceValue === "leetcode" || sourceValue === "gfg") && !sourceUrl?.trim()) {
      return Response.json({ error: "A source URL is required for LeetCode and GFG questions" }, { status: 400 });
    }
    if (Array.isArray(hints) && hints.filter((hint) => hint?.content?.trim()).length > 2) {
      return Response.json({ error: "A question can have at most two hints" }, { status: 400 });
    }
    if (Array.isArray(testCases) && testCases.some((testCase) => !String(testCase?.input || "").trim() || !String(testCase?.expectedOutput || "").trim())) {
      return Response.json({ error: "Every test case needs both input and output" }, { status: 400 });
    }

    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) {
      return Response.json({ error: "Question not found" }, { status: 404 });
    }

    const question = await prisma.$transaction(async (tx) => {
      const updated = await tx.question.update({
        where: { id },
        data: {
        title,
        description,
        difficulty,
        topics: topics || [],
        examples: examples || [],
        constraints: constraints || [],
        source: sourceValue,
        sourceUrl: sourceUrl?.trim() || null,
        expectedTC: expectedTC?.trim() || null,
        expectedSC: expectedSC?.trim() || null,
        leetcodeSlug,
        leetcodeId,
        },
      });

      if (Array.isArray(testCases)) {
        await tx.testCase.deleteMany({ where: { questionId: id } });
        const validCases = testCases
          .filter((testCase) => testCase && typeof testCase.input === "string" && typeof testCase.expectedOutput === "string")
          .map((testCase) => ({
            questionId: id,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            isSample: Boolean(testCase.isSample),
          }));
        if (validCases.length) await tx.testCase.createMany({ data: validCases });
      }
      if (Array.isArray(hints)) {
        await tx.hint.deleteMany({ where: { questionId: id } });
        const validHints = hints.filter((hint) => hint?.content?.trim()).map((hint, index) => ({ questionId: id, hintOrder: index + 1, content: hint.content.trim() }));
        if (validHints.length) await tx.hint.createMany({ data: validHints });
      }
      if (Array.isArray(optimalSolutions)) {
        await tx.optimalSolution.deleteMany({ where: { questionId: id } });
        const validSolutions = optimalSolutions.filter((solution) => solution?.language?.trim() && solution?.code?.trim()).map((solution) => ({ questionId: id, language: solution.language.trim(), code: solution.code.trim() }));
        if (validSolutions.length) await tx.optimalSolution.createMany({ data: validSolutions });
      }
      return updated;
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
