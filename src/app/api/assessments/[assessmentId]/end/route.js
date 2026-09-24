export const runtime = "nodejs";

import { auth } from "../../../../../auth";
import prisma from "../../../../../lib/prisma";

export async function POST(_request, { params }) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "You must be signed in." }, { status: 401 });
  const { assessmentId } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(assessmentId)) {
    return Response.json({ error: "Invalid assessment." }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!user) return Response.json({ error: "User not found." }, { status: 401 });

  const result = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "session" WHERE id = ${assessmentId}::uuid AND user_id = ${user.id}::uuid FOR UPDATE`;
    const assessment = await tx.session.findFirst({ where: { id: assessmentId, userId: user.id } });
    if (!assessment) return { error: "Assessment not found.", status: 404 };
    if (assessment.terminationReason) return { error: "This assessment has already been terminated.", status: 409 };
    const latest = await tx.submission.findFirst({ where: { sessionId: assessmentId }, orderBy: { createdAt: "desc" }, select: { status: true, passedTests: true, totalTests: true } });
    if (!latest) return { error: "Submit your code before ending the assessment.", status: 409 };
    const completed = await tx.session.update({ where: { id: assessmentId }, data: { completedAt: assessment.completedAt || new Date() }, select: { completedAt: true, violationCount: true } });
    return { completedAt: completed.completedAt, violationCount: completed.violationCount, latestSubmission: latest };
  });
  if (result.error) return Response.json({ error: result.error }, { status: result.status });
  return Response.json({ success: true, ...result });
}
