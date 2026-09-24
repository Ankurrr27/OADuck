import Link from "next/link";
import Sidebar from "../components/Sidebar";
import AppHeader from "../components/AppHeader";
import { auth } from "../../auth";
import prisma from "../../lib/prisma";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dayKey(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export default async function StatsPage() {
  const session = await auth();
  const user = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } })
    : null;

  let solvedCount = 0;
  let practiceSessionCount = 0;
  let currentStreak = 0;
  let activityDays = [];
  let totalViolationCount = 0;
  let terminatedSessionCount = 0;

  if (user) {
    const today = new Date();
    const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const startDate = new Date(todayUtc);
    startDate.setUTCDate(startDate.getUTCDate() - 83);
    const [acceptedQuestions, practiceSessions, recentSubmissions, violationTotals, terminatedSessions] = await Promise.all([
      prisma.submission.findMany({
        where: { userId: user.id, status: { equals: "Accepted", mode: "insensitive" }, questionId: { not: null } },
        distinct: ["questionId"],
        select: { questionId: true },
      }),
      prisma.session.count({ where: { userId: user.id } }),
      prisma.submission.findMany({
        where: { userId: user.id, createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
      prisma.session.aggregate({ where: { userId: user.id }, _sum: { violationCount: true } }),
      prisma.session.count({ where: { userId: user.id, terminationReason: { not: null } } }),
    ]);

    solvedCount = acceptedQuestions.length;
    practiceSessionCount = practiceSessions;
    totalViolationCount = violationTotals._sum.violationCount || 0;
    terminatedSessionCount = terminatedSessions;
    const activityCounts = new Map();
    for (const submission of recentSubmissions) {
      const key = dayKey(submission.createdAt);
      activityCounts.set(key, (activityCounts.get(key) || 0) + 1);
    }
    const activeDates = new Set(activityCounts.keys());
    const currentKey = dayKey(todayUtc);
    const yesterday = new Date(todayUtc);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    let streakDate = activeDates.has(currentKey) ? todayUtc : yesterday;
    while (activeDates.has(dayKey(streakDate))) {
      currentStreak += 1;
      streakDate = new Date(streakDate);
      streakDate.setUTCDate(streakDate.getUTCDate() - 1);
    }
    activityDays = Array.from({ length: 84 }, (_, index) => {
      const date = new Date(startDate);
      date.setUTCDate(date.getUTCDate() + index);
      const count = activityCounts.get(dayKey(date)) || 0;
      return { id: dayKey(date), count, label: `${dayKey(date)}: ${count} ${count === 1 ? "submission" : "submissions"}`, level: count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 6 ? 3 : 4 };
    });
  }

  const metrics = [
    { label: "Questions solved", value: String(solvedCount), detail: "Questions with an accepted solution" },
    { label: "Practice sessions", value: String(practiceSessionCount), detail: "Sessions started for your questions" },
    { label: "Current streak", value: `${currentStreak} ${currentStreak === 1 ? "day" : "days"}`, detail: "Consecutive days with a submission" },
    { label: "Violations", value: String(totalViolationCount), detail: "Recorded across your sessions" },
    { label: "Terminated sessions", value: String(terminatedSessionCount), detail: "Ended after the violation limit" },
  ];
  const activityColors = ["#edf0ec", "#dce9e0", "#b5d2c3", "#79ad98", "#176a5a"];

  return (
    <main className="min-h-screen bg-[#f5f4ef] text-[#17221e]">
      <AppHeader />
      <div className="flex min-h-[calc(100vh-60px)]">
        <Sidebar />
        <section className="mx-auto w-full max-w-[1180px] flex-1 px-[clamp(24px,4vw,56px)] py-14">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-[#a07725]">Your progress</p>
              <h1 className="m-0 text-[clamp(2rem,4vw,3.6rem)] font-medium tracking-[-.055em]">Build a practice rhythm.</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[#6f7771]">Track the small, consistent steps that turn interview preparation into confidence.</p>
            </div>
            <Link href="/practice" className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#123f36] px-4 py-2 text-[13px] font-semibold text-[#f7f5ed] no-underline transition hover:bg-[#195347]">
              Start a practice session
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3 lg:grid-cols-5 max-sm:grid-cols-1">
            {metrics.map((metric) => (
              <article className="grid min-h-40 content-between rounded-xl border border-[#dfe1da] bg-[#fffefa] p-5" key={metric.label}>
                <span className="text-xs font-semibold text-[#6f7771]">{metric.label}</span>
                <strong className="mt-7 text-[2.5rem] font-medium leading-none tracking-[-.06em] text-[#123f36]">{metric.value}</strong>
                <small className="mt-5 text-xs text-[#7c847e]">{metric.detail}</small>
              </article>
            ))}
          </div>

          <section className="mt-12 rounded-xl border border-[#dfe1da] bg-[#fffefa] p-[clamp(1.25rem,3vw,2rem)]" aria-labelledby="activity-heading">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-[#a07725]">Consistency</p>
                <h2 id="activity-heading" className="m-0 text-xl font-semibold tracking-[-.03em]">Activity heatmap</h2>
                <p className="mt-2 text-sm text-[#6f7771]">Your recent practice activity, across the last 12 weeks.</p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#6f7771]" aria-label="Activity legend">
                <span>Less</span>
                <span className="h-3 w-3 rounded-sm bg-[#edf0ec]" />
                <span className="h-3 w-3 rounded-sm bg-[#c9ddd3]" />
                <span className="h-3 w-3 rounded-sm bg-[#79ad98]" />
                <span className="h-3 w-3 rounded-sm bg-[#176a5a]" />
                <span>More</span>
              </div>
            </div>

            <div className="mt-8 flex min-w-0 gap-3 overflow-x-auto pb-1">
              <div className="grid grid-rows-7 gap-1 pt-0.5 text-[10px] text-[#7c847e]">
                {weekDays.map((day) => <span className="h-3" key={day}>{["Mon", "Wed", "Fri"].includes(day) ? day : ""}</span>)}
              </div>
              <div className="grid min-w-[530px] grid-flow-col grid-rows-7 gap-1" role="group" aria-label="Submission activity in the last 12 weeks">
                {activityDays.map((day) => (
                  <span className="h-3 w-3 rounded-[3px]" key={day.id} aria-label={day.label} title={day.label} style={{ backgroundColor: activityColors[day.level] }} />
                ))}
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[#e7e9e4] pt-5 text-sm text-[#6f7771]">
              <span>{activityDays.some((day) => day.count > 0) ? `${activityDays.reduce((total, day) => total + day.count, 0)} submissions in the last 12 weeks.` : "No recent submissions yet — run or submit a solution to start tracking activity."}</span>
              <Link href="/questions" className="font-semibold text-[#176a5a] underline decoration-[#9ebfb2] underline-offset-4">Browse questions</Link>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
