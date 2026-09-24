export const runtime = "nodejs";

import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma";

function configuredMode() {
  return process.env.ASSESSMENT_MODE === "STRICT" ? "STRICT" : "NORMAL";
}

function configuredDurationMinutes() {
  const configured = Number.parseInt(process.env.ASSESSMENT_DURATION_MINUTES || "30", 10);
  return Number.isFinite(configured) ? Math.min(360, Math.max(1, configured)) : 30;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "You must be signed in." }, { status: 401 });
  return Response.json({ mode: configuredMode(), durationMinutes: configuredDurationMinutes() });
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "You must be signed in." }, { status: 401 });
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  if (!body.questionId) return Response.json({ error: "Question is required." }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  const question = await prisma.question.findUnique({ where: { id: body.questionId }, select: { id: true } });
  if (!user) return Response.json({ error: "User not found." }, { status: 401 });
  if (!question) return Response.json({ error: "Question not found." }, { status: 404 });
  // The mode is deployment configuration, never a client supplied value.
  const mode = configuredMode();
  const startedAt = new Date();
  const assessment = await prisma.session.create({
    data: { userId: user.id, questionId: question.id, monitoringMode: mode },
    select: { id: true, monitoringMode: true, violationCount: true },
  });
  return Response.json({ assessmentId: assessment.id, mode: assessment.monitoringMode, count: assessment.violationCount, terminated: false, maxViolations: 3, startedAt: startedAt.toISOString(), durationMinutes: configuredDurationMinutes() });
}
