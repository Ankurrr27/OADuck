export const runtime = "nodejs";

import { redirect } from "next/navigation";
import Link from "next/link";
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
    <main className="admin-page min-h-screen bg-[#f5f4ef] text-[#17221e]">
      <AppHeader />
      <div className="flex min-h-[calc(100vh-60px)] ">
        <Sidebar />
        <section className="w-full max-w-[900px] flex-1 mx-auto px-[clamp(24px,4vw,56px)] py-19 max-w-[1120px]">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-[#a07725]">Administration</p>
          <div className="flex items-end justify-between gap-6">
            <div>
              <h1>Admin dashboard</h1>
              <p className="mt-4 text-sm text-[#6f7771]">A quick view of the OA Duck workspace.</p>
            </div>
            <div className="grid min-w-52 gap-1 border-l border-[#dfe1da] pl-4.5 text-[11px] text-[#6f7771]" style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <div>
                <span>Signed in as</span>
                <strong>{session.user.email}</strong>
              </div>
              <Link href="/admin/questions/new" className="inline-flex min-h-10 items-center justify-center rounded-md border-0 bg-[#123f36] px-4 py-2 text-[13px] font-semibold text-[#f7f5ed] no-underline disabled:cursor-wait disabled:opacity-65" style={{ textDecoration: "none", margin: 0 }}>+ Add Question</Link>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
            <div className="grid min-h-36 content-between rounded-lg border border-[#dfe1da] bg-[#fffefa] p-4.5 [&_span]:text-[11px] [&_span]:text-[#6f7771] [&_small]:text-[11px] [&_small]:text-[#6f7771] [&_strong]:text-[38px] [&_strong]:font-medium [&_strong]:tracking-[-.06em] [&_strong]:text-[#123f36]"><span>Users</span><strong>{userCount}</strong><small>registered accounts</small></div>
            <div className="grid min-h-36 content-between rounded-lg border border-[#dfe1da] bg-[#fffefa] p-4.5 [&_span]:text-[11px] [&_span]:text-[#6f7771] [&_small]:text-[11px] [&_small]:text-[#6f7771] [&_strong]:text-[38px] [&_strong]:font-medium [&_strong]:tracking-[-.06em] [&_strong]:text-[#123f36]"><span>Questions</span><strong>{questionCount}</strong><small>in the library</small></div>
            <div className="grid min-h-36 content-between rounded-lg border border-[#dfe1da] bg-[#fffefa] p-4.5 [&_span]:text-[11px] [&_span]:text-[#6f7771] [&_small]:text-[11px] [&_small]:text-[#6f7771] [&_strong]:text-[38px] [&_strong]:font-medium [&_strong]:tracking-[-.06em] [&_strong]:text-[#123f36]"><span>Sessions</span><strong>{sessionCount}</strong><small>practice sessions</small></div>
            <div className="grid min-h-36 content-between rounded-lg border border-[#dfe1da] bg-[#fffefa] p-4.5 [&_span]:text-[11px] [&_span]:text-[#6f7771] [&_small]:text-[11px] [&_small]:text-[#6f7771] [&_strong]:text-[38px] [&_strong]:font-medium [&_strong]:tracking-[-.06em] [&_strong]:text-[#123f36]"><span>Submissions</span><strong>{submissionCount}</strong><small>attempts recorded</small></div>
          </div>
          <div className="mt-14 flex items-center justify-between gap-6 border-b border-[#dfe1da] pb-3.5">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-[#a07725]">People</p>
              <h2>Registered users</h2>
            </div>
            <span>{userCount} total</span>
          </div>
          <div className="border-b border-[#dfe1da]">
            {users.map((user) => (
              <div className="flex items-center gap-3 border-b border-[#dfe1da] px-1 py-3.5" key={user.email}>
                <div className="grid h-8.5 w-8.5 shrink-0 place-items-center rounded-full bg-[#123f36] text-[13px] font-bold text-[#f7f5ed]">{(user.name || user.email).charAt(0).toUpperCase()}</div>
                <div className="grid min-w-0 flex-1 gap-0.5 [&_strong]:truncate [&_strong]:text-[13px] [&_strong]:text-[#17221e] [&_span]:truncate [&_span]:text-[11px] [&_span]:text-[#6f7771]">
                  <strong>{user.name || "Unnamed user"}</strong>
                  <span>{user.username ? `@${user.username}` : user.email}</span>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-bold tracking-[.06em] rounded-full px-2 py-1 text-[10px] font-bold tracking-[.06em]-${user.role.toLowerCase()}`}>{user.role}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
