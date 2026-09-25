export const runtime = "nodejs";

import { auth } from "../../../auth";
import prisma from "../../../lib/prisma";
import { analyzeDuckInsight } from "../../../lib/duck-insight";

export async function POST(request) {
  const authSession = await auth();
  if (!authSession?.user?.email) {
    return Response.json({ error: "Sign in to use Duck Insight." }, { status: 401 });
  }

  let question = null;
  let optimal = null;

  try {
    const body = await request.json();
    if (typeof body.sessionId !== "string" || typeof body.code !== "string" || body.code.length > 50_000) {
      return Response.json({ error: "A valid assessment and submitted code are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: authSession.user.email }, select: { id: true } });
    if (!user) return Response.json({ error: "User not found." }, { status: 401 });

    const session = await prisma.session.findFirst({
      where: { id: body.sessionId, userId: user.id, completedAt: { not: null }, terminationReason: null },
      select: {
        id: true,
        question: {
          select: {
            title: true,
            description: true,
            constraints: true,
            examples: true,
            expectedTC: true,
            expectedSC: true,
            testCases: { where: { isSample: true }, orderBy: { id: "asc" }, select: { input: true, expectedOutput: true } },
            optimalSolutions: { orderBy: { language: "asc" }, select: { language: true, code: true } },
          },
        },
        submissions: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true, sourceCode: true, language: true, errorMessage: true } },
      },
    });
    const latest = session?.submissions?.[0];
    if (!session || !latest || latest.language !== "cpp" || latest.status.toLowerCase() === "accepted" || latest.sourceCode !== body.code) {
      return Response.json({ error: "Duck Insight is available only for the incorrect code submitted at the end of your assessment." }, { status: 403 });
    }

    question = session.question;
    optimal = question.optimalSolutions.find((solution) => solution.language.toLowerCase() === "cpp" || solution.language.toLowerCase().includes("c++"));
    const analysis = await analyzeDuckInsight({
      title: question.title || "Untitled problem",
      description: question.description || "Not provided",
      constraints: JSON.stringify(question.constraints || []),
      examples: JSON.stringify(question.examples || []),
      tests: JSON.stringify(question.testCases),
      expectedTC: question.expectedTC || "Not specified",
      expectedSC: question.expectedSC || "Not specified",
      candidateCode: body.code,
      optimalCode: optimal?.code || "",
      errorStatus: latest.status,
      errorMessage: latest.errorMessage || "None",
    });

    // The analysis is returned directly and is deliberately not written to the database.
    return Response.json({ analysis, optimalCode: optimal?.code || null });
  } catch (error) {
    console.error("Duck Insight failed:", error);
    const message = error?.message?.includes("AI_API_KEY") || error?.message?.includes("not configured")
      ? error.message
      : "Duck Insight could not generate the analysis right now. Please try again later.";
    return Response.json({ 
      error: message,
      optimalCode: optimal?.code || null,
      expectedTC: question?.expectedTC || "Not specified",
      expectedSC: question?.expectedSC || "Not specified"
    }, { status: 503 });
  }
}
