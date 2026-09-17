export const runtime = "nodejs";

import { redirect } from "next/navigation";
import AppHeader from "../components/AppHeader";
import Sidebar from "../components/Sidebar";
import { auth } from "../../auth";
import prisma from "../../lib/prisma";

export default async function AdminPage() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  const [userCount, questionCount, sessionCount, submissionCount, users] = await Promise.all([
    prisma.user.count(),
    prisma.question.count(),
    prisma.session.count(),
    prisma.submission.count(),
    prisma.user.findMany({
      select: { name: true, email: true, username: true, role: true },
      orderBy: { email: "asc" },
      take: 8,
    }),
  ]);

  return (
    <main className="inner-page-shell">
      <AppHeader />
      <div className="dashboard-layout inner-page-layout">
        <Sidebar />
        <section className="inner-page-content admin-page-content">
          <p className="eyebrow">Administration</p>
          <div className="admin-heading-row">
            <div>
              <h1>Admin dashboard</h1>
              <p className="inner-page-lede">A quick view of the OA Duck workspace.</p>
            </div>
            <div className="admin-identity">
              <span>Signed in as</span>
              <strong>{session.user.email}</strong>
            </div>
          </div>
          <div className="admin-stat-grid">
            <div className="admin-stat-card"><span>Users</span><strong>{userCount}</strong><small>registered accounts</small></div>
            <div className="admin-stat-card"><span>Questions</span><strong>{questionCount}</strong><small>in the library</small></div>
            <div className="admin-stat-card"><span>Sessions</span><strong>{sessionCount}</strong><small>practice sessions</small></div>
            <div className="admin-stat-card"><span>Submissions</span><strong>{submissionCount}</strong><small>attempts recorded</small></div>
          </div>
          <div className="admin-section-heading">
            <div>
              <p className="eyebrow">People</p>
              <h2>Registered users</h2>
            </div>
            <span>{userCount} total</span>
          </div>
          <div className="admin-user-list">
            {users.map((user) => (
              <div className="admin-user-row" key={user.email}>
                <div className="admin-user-avatar">{(user.name || user.email).charAt(0).toUpperCase()}</div>
                <div className="admin-user-details">
                  <strong>{user.name || "Unnamed user"}</strong>
                  <span>{user.username ? `@${user.username}` : user.email}</span>
                </div>
                <span className={`admin-role admin-role-${user.role.toLowerCase()}`}>{user.role}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}