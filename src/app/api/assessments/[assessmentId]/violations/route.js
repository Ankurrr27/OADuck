export const runtime = "nodejs";

import { auth } from "../../../../../auth";
import prisma from "../../../../../lib/prisma";

const MAX_VIOLATIONS = 3;
const VIOLATION_TYPES = new Set(["COPY", "PASTE", "BACK_NAVIGATION", "TAB_SWITCH", "FULLSCREEN_EXIT"]);

async function currentUser(session) {
  if (!session?.user?.email) return null;
  return prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
}

export async function POST(request, { params }) {
  const authSession = await auth();
  const user = await currentUser(authSession);
  if (!user) return Response.json({ error: "You must be signed in." }, { status: 401 });

  const { assessmentId } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(assessmentId)) {
    return Response.json({ error: "Assessment not found." }, { status: 404 });
  }
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }

  if (!VIOLATION_TYPES.has(body.type)) return Response.json({ error: "Unsupported violation type." }, { status: 400 });

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Lock the assessment row so concurrent browser events cannot lose increments.
      await tx.$queryRaw`SELECT id FROM "session" WHERE id = ${assessmentId}::uuid AND user_id = ${user.id}::uuid FOR UPDATE`;
      const assessment = await tx.session.findFirst({ where: { id: assessmentId, userId: user.id } });
      if (!assessment) return { error: "Assessment not found.", status: 404 };
      if (assessment.terminationReason) return { terminated: true, count: assessment.violationCount, mode: assessment.monitoringMode, adminTestMode: assessment.adminTestMode };

      const count = assessment.violationCount + 1;
      const terminated = !assessment.adminTestMode && (body.type === "FULLSCREEN_EXIT" || assessment.monitoringMode === "STRICT" || count >= MAX_VIOLATIONS);
      const timestamp = new Date();
      await tx.assessmentViolation.create({ data: { assessmentId, type: body.type, timestamp } });
      await tx.session.update({
        where: { id: assessmentId },
        data: { violationCount: count, ...(terminated ? { terminationReason: body.type === "FULLSCREEN_EXIT" ? "Assessment terminated after exiting full screen." : `Assessment terminated after ${body.type.toLowerCase()} violation.` } : {}) },
      });
      return { count, mode: assessment.monitoringMode, terminated, adminTestMode: assessment.adminTestMode, timestamp: timestamp.toISOString(), maxViolations: MAX_VIOLATIONS };
    });
    if (result.error) return Response.json({ error: result.error }, { status: result.status });
    return Response.json(result);
  } catch (error) {
    console.error("Assessment violation recording failed:", error);
    return Response.json({ error: "Unable to record violation." }, { status: 500 });
  }
}
