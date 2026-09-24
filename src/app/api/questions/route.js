export const runtime = "nodejs";

import { auth } from "../../../auth";
import prisma from "../../../lib/prisma";

const VALID_SOURCES = new Set(["leetcode", "gfg", "admin"]);

function validateQuestionPayload(body) {
  const source = body.source || "admin";
  if (!VALID_SOURCES.has(source)) {
    return "Source must be leetcode, gfg, or admin";
  }
  if ((source === "leetcode" || source === "gfg") && !body.sourceUrl?.trim()) {
    return "A source URL is required for LeetCode and GFG questions";
  }
  if (!body.title?.trim() || !body.difficulty?.trim()) {
    return "Title and difficulty are required";
  }
  if (Array.isArray(body.hints) && body.hints.filter((hint) => hint?.content?.trim()).length > 2) {
    return "A question can have at most two hints";
  }
  if (Array.isArray(body.testCases) && body.testCases.some((testCase) => !String(testCase?.input || "").trim() || !String(testCase?.expectedOutput || "").trim())) {
    return "Every test case needs both input and output";
  }
  return null;
}

export async function GET() {
  try {
    const session = await auth();
    const user = session?.user?.email
      ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } })
      : null;
    const questions = await prisma.question.findMany({
      orderBy: { questionNumber: "asc" },
      select: {
        id: true,
        questionNumber: true,
        title: true,
        difficulty: true,
        topics: true,
        source: true,
        sourceUrl: true,
        leetcodeSlug: true,
        expectedTC: true,
        expectedSC: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    const submissions = user ? await prisma.submission.findMany({
      where: { userId: user.id, questionId: { not: null } },
      select: { questionId: true, status: true },
    }) : [];
    const progress = submissions.reduce((result, submission) => {
      const current = result[submission.questionId] || { attempts: 0, solved: false };
      current.attempts += 1;
      if (submission.status?.toLowerCase() === "accepted") current.solved = true;
      result[submission.questionId] = current;
      return result;
    }, {});
    const questionsWithProgress = questions.map((question) => ({
      ...question,
      progress: progress[question.id] || { attempts: 0, solved: false },
    }));

    return Response.json({ success: true, questions: questionsWithProgress });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return Response.json({ success: false, error: "Failed to fetch questions" }, { status: 500 });
  }
}


export async function POST(request) {
  try {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const validationError = validateQuestionPayload(body);
    if (validationError) {
      return Response.json({ error: validationError }, { status: 400 });
    }

    // Find the current user ID to set as creator
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!dbUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const question = await prisma.question.create({
      data: {
        title,
        description,
        difficulty,
        topics: topics || [],
        examples: examples || [],
        constraints: constraints || [],
        source,
        sourceUrl: sourceUrl?.trim() || null,
        expectedTC: expectedTC?.trim() || null,
        expectedSC: expectedSC?.trim() || null,
        leetcodeSlug,
        leetcodeId,
        createdById: dbUser.id,
        hints: Array.isArray(hints) ? {
          create: hints.filter((hint) => hint?.content?.trim()).map((hint, index) => ({
            hintOrder: index + 1,
            content: hint.content.trim(),
          })),
        } : undefined,
        testCases: Array.isArray(testCases) ? { create: testCases.filter((testCase) => typeof testCase?.input === "string" && typeof testCase?.expectedOutput === "string").map((testCase) => ({ input: testCase.input.trim(), expectedOutput: testCase.expectedOutput.trim(), isSample: Boolean(testCase.isSample) })) } : undefined,
        optimalSolutions: Array.isArray(optimalSolutions) ? {
          create: optimalSolutions.filter((solution) => solution?.language?.trim() && solution?.code?.trim()).map((solution) => ({
            language: solution.language.trim(),
            code: solution.code.trim(),
          })),
        } : undefined,
      },
    });

    return Response.json({ success: true, question });
  } catch (error) {
    console.error("Error creating question:", error);
    return Response.json({
      success: false,
      error: process.env.NODE_ENV === "development" ? error.message : "Failed to create question",
    }, { status: 500 });
  }
}
