export const runtime = "nodejs";

import { auth } from "../../../auth";
import prisma from "../../../lib/prisma";

export async function GET() {
  try {
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
      },
    });

    return Response.json({ success: true, questions });
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
    } = body;

    if (!title || !difficulty) {
      return Response.json({ error: "Title and difficulty are required" }, { status: 400 });
    }

    // Find the current user ID to set as creator
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!dbUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Compute the next question number
    const lastQuestion = await prisma.question.findFirst({
      orderBy: { questionNumber: "desc" },
      select: { questionNumber: true },
    });
    const nextNumber = (lastQuestion?.questionNumber ?? 0) + 1;

    const question = await prisma.question.create({
      data: {
        questionNumber: nextNumber,
        title,
        description,
        difficulty,
        topics: topics || [],
        examples: examples || [],
        constraints: constraints || [],
        source: source || "internal",
        sourceUrl,
        leetcodeSlug,
        leetcodeId,
        createdById: dbUser.id,
        ...(Array.isArray(testCases)
          ? {
              testCases: {
                create: testCases
                  .filter((testCase) => testCase && typeof testCase.input === "string" && typeof testCase.expectedOutput === "string")
                  .map((testCase) => ({
                    input: testCase.input,
                    expectedOutput: testCase.expectedOutput,
                    isSample: Boolean(testCase.isSample),
                  })),
              },
            }
          : {}),
      },
    });

    return Response.json({ success: true, question });
  } catch (error) {
    console.error("Error creating question:", error);
    return Response.json({ success: false, error: "Failed to create question" }, { status: 500 });
  }
}
