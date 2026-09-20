export const runtime = "nodejs";

import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma";
import { executeCode, normalizeResult, normalizeStdin } from "../../../../lib/judge0";

function normalizeOutput(value) {
  return String(value ?? "").replace(/\r\n/g, "\n").trim().split(/\s+/).filter(Boolean).join(" ");
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "You must be signed in to run code." }, { status: 401 });

  try {
    const body = await request.json();
    if (body.language !== "cpp" || typeof body.code !== "string") return Response.json({ error: "C++ and code are required." }, { status: 400 });
    if (body.code.length > 50000) return Response.json({ error: "Code must be 50,000 characters or fewer." }, { status: 413 });
    if (body.problemId && !body.custom) {
      const question = await prisma.question.findUnique({ where: { id: body.problemId }, select: { testCases: { where: { isSample: true }, select: { input: true, expectedOutput: true }, orderBy: { id: "asc" } } } });
      if (!question) return Response.json({ error: "Problem not found." }, { status: 404 });
      const tests = question.testCases.slice(0, 20);
      if (!tests.length) {
        const result = normalizeResult(await executeCode({
          language: body.language,
          sourceCode: body.code,
          stdin: normalizeStdin(typeof body.stdin === "string" ? body.stdin : ""),
        }));
        return Response.json({ success: true, warning: "No public test cases are configured; executed the supplied stdin.", result });
      }
      const results = [];
      for (const test of tests) {
        const result = normalizeResult(await executeCode({ language: "cpp", sourceCode: body.code, stdin: normalizeStdin(test.input), timeoutSeconds: 2 }));
        results.push({
          passed: result.statusId === 3 && normalizeOutput(result.stdout) === normalizeOutput(test.expectedOutput),
          input: test.input,
          expectedOutput: test.expectedOutput,
          result,
        });
      }
      return Response.json({ success: true, results, result: results[0]?.result || null });
    }
    const result = await executeCode({ language: body.language, sourceCode: body.code, stdin: normalizeStdin(typeof body.stdin === "string" ? body.stdin : "") });
    return Response.json({ success: true, result: normalizeResult(result) });
  } catch (error) {
    console.error("Code execution failed:", error);
    return Response.json({ success: false, error: error.message || "Code execution failed." }, { status: 502 });
  }
}
