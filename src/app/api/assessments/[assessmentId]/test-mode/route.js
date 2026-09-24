export const runtime = "nodejs";

import { auth } from "../../../../../auth";
import prisma from "../../../../../lib/prisma";

export async function POST(request, { params }) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "You must be signed in." }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, role: true } });
  if (user?.role !== "ADMIN") return Response.json({ error: "Admin access required." }, { status: 403 });

  const { assessmentId } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(assessmentId)) {
    return Response.json({ error: "Assessment not found." }, { status: 404 });
  }
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  if (typeof body.enabled !== "boolean") return Response.json({ error: "enabled must be a boolean." }, { status: 400 });

  try {
    const assessment = await prisma.session.findFirst({ where: { id: assessmentId, userId: user.id } });
    if (!assessment) return Response.json({ error: "Assessment not found." }, { status: 404 });
    if (assessment.terminationReason || assessment.completedAt) {
      return Response.json({ error: "This session has already ended." }, { status: 409 });
    }
    const updated = await prisma.session.update({ where: { id: assessmentId }, data: { adminTestMode: body.enabled }, select: { adminTestMode: true } });
    return Response.json({ adminTestMode: updated.adminTestMode });
  } catch (error) {
    console.error("Admin test mode update failed:", error);
    const staleClient = error?.name === "PrismaClientValidationError";
    return Response.json({
      error: staleClient
        ? "The server has a stale Prisma Client. Restart the Next.js dev server, then start a new assessment."
        : "Could not update admin test mode. Check the server logs and try again.",
    }, { status: 503 });
  }
}
