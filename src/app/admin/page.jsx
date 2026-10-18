export const runtime = "nodejs";

import { redirect } from "next/navigation";
import AppHeader from "../components/AppHeader";
import Sidebar from "../components/Sidebar";
import { auth } from "../../auth";
import prisma from "../../lib/prisma";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const [users, questions, submissions, sessionCount] = await Promise.all([
    prisma.user.findMany({ select: { name: true, email: true, username: true, role: true }, orderBy: { email: "asc" } }),
    prisma.question.findMany({ orderBy: { questionNumber: "asc" }, select: { id: true, questionNumber: true, title: true, difficulty: true, topics: true } }),
    prisma.submission.findMany({ where: { questionId: { not: null } }, orderBy: { createdAt: "desc" }, select: { questionId: true, userId: true, status: true, createdAt: true } }),
    prisma.session.count(),
  ]);

  return <main className="admin-page admin-shell"><AppHeader /><div className="admin-shell__body"><Sidebar /><AdminDashboard currentUser={session.user} users={users} questions={questions} submissions={submissions.map((submission) => ({ ...submission, createdAt: submission.createdAt.toISOString() }))} sessionCount={sessionCount} /></div></main>;
}
