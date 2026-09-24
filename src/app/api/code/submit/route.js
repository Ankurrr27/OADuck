export const runtime = "nodejs";

import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma";
import {
  executeCode,
  normalizeResult,
  normalizeStdin,
} from "../../../../lib/judge0";

function normalizeOutput(value) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join(" ");
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.email)
    return Response.json(
      { error: "You must be signed in to submit code." },
      { status: 401 },
    );

  try {
    const body = await request.json();
    const problemId = body.problemId || body.questionId;
    if (!problemId || body.language !== "cpp" || typeof body.code !== "string")
      return Response.json(
        { error: "Problem, C++, and code are required." },
        { status: 400 },
      );
    if (body.code.length > 50000)
      return Response.json(
        { error: "Code must be 50,000 characters or fewer." },
        { status: 413 },
      );

    const question = await prisma.question.findUnique({
      where: { id: problemId },
      select: {
        id: true,
        questionNumber: true,
        title: true,
        expectedTC: true,
        expectedSC: true,
        testCases: {
          select: {
            id: true,
            input: true,
            expectedOutput: true,
            isSample: true,
          },
          orderBy: { id: "asc" },
        },
      },
    });
    if (!question)
      return Response.json({ error: "Problem not found." }, { status: 404 });
    const hiddenCases = question.testCases.filter(
      (testCase) => !testCase.isSample,
    );
    if (!hiddenCases.length)
      return Response.json(
        { error: "Hidden test cases are not configured for this problem yet." },
        { status: 400 },
      );

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user)
      return Response.json({ error: "User not found." }, { status: 401 });
    let practiceSession;
    if (body.assessmentId) {
      practiceSession = await prisma.session.findFirst({
        where: { id: body.assessmentId, userId: user.id, questionId: question.id },
      });
      if (!practiceSession) return Response.json({ error: "Assessment not found." }, { status: 404 });
      if (practiceSession.terminationReason) {
        return Response.json({ error: "Assessment Terminated. Submissions are disabled." }, { status: 403 });
      }
      if (practiceSession.completedAt) {
        return Response.json({ error: "This assessment is already completed." }, { status: 403 });
      }
    } else {
      practiceSession = await prisma.session.findFirst({
        where: { userId: user.id, questionId: question.id, terminationReason: null },
        orderBy: { id: "desc" },
      });
      if (!practiceSession) practiceSession = await prisma.session.create({ data: { userId: user.id, questionId: question.id } });
    }

    let passedTests = 0;
    let finalResult = null;
    let failedTestCaseId = null;
    let failedTestNumber = null;
    const testCases = question.testCases.slice(0, 100);
    const testResults = [];
    const visibleTerminalLines = [];
    let firstHiddenDiagnostic = "";
    for (const [index, testCase] of testCases.entries()) {
      const result = normalizeResult(
        await executeCode({
          language: "cpp",
          sourceCode: body.code,
          stdin: normalizeStdin(testCase.input),
          timeoutSeconds: 2,
        }),
      );
      const passed = result.statusId === 3 && normalizeOutput(result.stdout) === normalizeOutput(testCase.expectedOutput);
      if (result.statusId === 3 && !passed) result.verdict = "Wrong Answer";
      if (passed) passedTests += 1;
      if (!passed && !failedTestCaseId) {
        failedTestCaseId = testCase.id;
        failedTestNumber = index + 1;
        finalResult = result;
      }
      if (!finalResult) finalResult = result;
      const isHidden = !testCase.isSample;
      const diagnostic = result.stderr || result.compileOutput || result.message || "";
      testResults.push({
        label: isHidden ? `Hidden test ${hiddenCases.indexOf(testCase) + 1}` : `Sample ${question.testCases.filter((item) => item.isSample).indexOf(testCase) + 1}`,
        isHidden,
        passed,
        verdict: passed ? "Passed" : result.verdict,
        ...(isHidden ? {} : { input: testCase.input, expectedOutput: testCase.expectedOutput, result }),
      });
      if (!isHidden) visibleTerminalLines.push(`Sample ${question.testCases.filter((item) => item.isSample).indexOf(testCase) + 1}: ${passed ? "Passed" : result.verdict}\n${result.stdout || diagnostic || "No output."}`);
      else if (!passed && diagnostic && !firstHiddenDiagnostic) firstHiddenDiagnostic = `${testResults.at(-1).label}: ${diagnostic}`;
    }
    const totalTests = testCases.length;
    const verdict =
      passedTests === totalTests
        ? "Accepted"
        : finalResult?.verdict || "Runtime Error";
    const submissionData = {
        sessionId: practiceSession.id,
        userId: user.id,
        questionId: question.id,
        language: "cpp",
        sourceCode: body.code,
        status: verdict,
        runtimeMs: finalResult?.time
          ? Math.round(Number(finalResult.time) * 1000)
          : null,
        memoryKb: finalResult?.memory || null,
        passedTests,
        totalTests,
        failedTestCaseId,
        actualOutput: finalResult?.stdout || null,
        errorMessage: finalResult?.stderr || finalResult?.compileOutput || null,
      };
    if (body.assessmentId) {
      const saved = await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM "session" WHERE id = ${practiceSession.id}::uuid FOR UPDATE`;
        const latestAssessment = await tx.session.findUnique({ where: { id: practiceSession.id }, select: { terminationReason: true, completedAt: true } });
        if (latestAssessment?.terminationReason) return "terminated";
        if (latestAssessment?.completedAt) return "completed";
        await tx.submission.create({ data: submissionData });
        return true;
      });
      if (saved === "terminated") return Response.json({ error: "Assessment Terminated. Submissions are disabled." }, { status: 403 });
      if (saved === "completed") return Response.json({ error: "This assessment is already completed." }, { status: 403 });
    } else {
      await prisma.submission.create({ data: submissionData });
    }
    const attempts = await prisma.submission.count({
      where: { userId: user.id, questionId: question.id },
    });

    return Response.json({
      success: true,
      status: verdict,
      questionNumber: question.questionNumber,
      questionTitle: question.title,
      expectedTC: question.expectedTC,
      expectedSC: question.expectedSC,
      attempts,
      passedTests,
      totalTests,
      failedTestNumber,
      runtime: finalResult?.time || null,
      memory: finalResult?.memory || null,
      testResults,
      terminalOutput: [visibleTerminalLines.join("\n\n"), firstHiddenDiagnostic].filter(Boolean).join("\n\n"),
    });
  } catch (error) {
    console.error("Code submission failed:", error);
    return Response.json(
      { success: false, error: error.message || "Code submission failed." },
      { status: 502 },
    );
  }
}
