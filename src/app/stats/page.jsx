import Link from "next/link";
import Sidebar from "../components/Sidebar";
import AppHeader from "../components/AppHeader";
import { auth } from "../../auth";
import prisma from "../../lib/prisma";

const weekDays = ["Mon", "", "Wed", "", "Fri", "", ""];

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
  let activityCounts = new Map();
  let totalSubmissions = 0;
  let activeDays = 0;
  let longestStreak = 0;
  let totalViolationCount = 0;
  let terminatedSessionCount = 0;
  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const startDate = new Date(todayUtc);
  const mondayOffset = (startDate.getUTCDay() + 6) % 7;
  startDate.setUTCDate(startDate.getUTCDate() - mondayOffset - 364);
  const yearStartDate = new Date(todayUtc);
  yearStartDate.setUTCDate(yearStartDate.getUTCDate() - 364);

  if (user) {
    const [acceptedQuestions, practiceSessions, recentSubmissions, violationTotals, terminatedSessions] = await Promise.all([
      prisma.submission.findMany({
        where: { userId: user.id, status: { equals: "Accepted", mode: "insensitive" }, questionId: { not: null } },
        distinct: ["questionId"],
        select: { questionId: true },
      }),
      prisma.session.count({ where: { userId: user.id } }),
      prisma.submission.findMany({
        where: { userId: user.id, createdAt: { gte: yearStartDate, lte: new Date(todayUtc.getTime() + 86_399_999) } },
        select: { createdAt: true },
      }),
      prisma.session.aggregate({ where: { userId: user.id }, _sum: { violationCount: true } }),
      prisma.session.count({ where: { userId: user.id, terminationReason: { not: null } } }),
    ]);

    solvedCount = acceptedQuestions.length;
    practiceSessionCount = practiceSessions;
    totalViolationCount = violationTotals._sum.violationCount || 0;
    terminatedSessionCount = terminatedSessions;
    for (const submission of recentSubmissions) {
      const key = dayKey(submission.createdAt);
      activityCounts.set(key, (activityCounts.get(key) || 0) + 1);
    }
    totalSubmissions = recentSubmissions.length;
    activeDays = activityCounts.size;
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
    let runningStreak = 0;
    for (let index = 0; index < 365; index += 1) {
      const date = new Date(yearStartDate);
      date.setUTCDate(date.getUTCDate() + index);
      if (activeDates.has(dayKey(date))) {
        runningStreak += 1;
        longestStreak = Math.max(longestStreak, runningStreak);
      } else runningStreak = 0;
    }
  }

  const activityDays = Array.from({ length: 371 }, (_, index) => {
    const date = new Date(startDate);
    date.setUTCDate(date.getUTCDate() + index);
    const count = activityCounts.get(dayKey(date)) || 0;
    const isFuture = date > todayUtc || date < yearStartDate;
    return {
      id: dayKey(date),
      count,
      isFuture,
      label: `${dayKey(date)}: ${count} ${count === 1 ? "submission" : "submissions"}`,
      level: count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 6 ? 3 : 4,
    };
  });
  const activityWeeks = Array.from({ length: 53 }, (_, weekIndex) => {
    const date = new Date(startDate);
    date.setUTCDate(date.getUTCDate() + weekIndex * 7);
    const previousDate = weekIndex > 0 ? new Date(startDate) : null;
    if (previousDate) previousDate.setUTCDate(previousDate.getUTCDate() + (weekIndex - 1) * 7);
    return previousDate && previousDate.getUTCMonth() === date.getUTCMonth()
      ? ""
      : date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  });

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
        <section className="mx-auto w-full max-w-[1440px] flex-1 px-[clamp(20px,3vw,40px)] py-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dfe1da] pb-4">
            <div>
              <h1 className="m-0 text-2xl font-semibold tracking-[-.045em] text-[#123f36] sm:text-[28px]">Your progress</h1>
              <p className="mt-1 text-sm text-[#6f7771]">Track the steps that build your interview confidence.</p>
            </div>
            <Link href="/practice" className="inline-flex min-h-9 items-center justify-center rounded-md bg-[#123f36] px-3 py-2 text-xs font-semibold text-[#f7f5ed] no-underline transition hover:bg-[#195347]">
              Start practice
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-5 max-sm:grid-cols-1">
            {metrics.map((metric) => (
              <article className="grid min-h-28 content-between rounded-md border border-[#dfe1da] bg-[#fffefa] p-3.5" key={metric.label}>
                <span className="text-xs font-semibold text-[#6f7771]">{metric.label}</span>
                <strong className="mt-3 text-3xl font-medium leading-none tracking-[-.06em] text-[#123f36]">{metric.value}</strong>
                <small className="mt-2 text-[11px] text-[#7c847e]">{metric.detail}</small>
              </article>
            ))}
          </div>

          <section className="mt-4 rounded-md border border-[#dfe1da] bg-[#fffefa] p-4 sm:p-5" aria-labelledby="activity-heading">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 id="activity-heading" className="m-0 text-lg font-semibold tracking-[-.03em]">Activity heatmap</h2>
                <p className="mt-1 text-xs text-[#6f7771]">Your daily submission history for the past year.</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-[#6f7771]" aria-label="Activity scale, fewer to more submissions">
                <span className="mr-1">Less</span>
                {activityColors.map((color, index) => <span key={color} className="h-3 w-3 rounded-[3px] border border-black/[.03]" style={{ backgroundColor: color }} aria-label={["0 submissions", "1 submission", "2 to 3 submissions", "4 to 6 submissions", "7 or more submissions"][index]} />)}
                <span className="ml-1">More</span>
              </div>
            </div>

            <div className="mb-4 mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-[#e7e9e4] pb-3">
              <p className="mr-auto text-sm text-[#6f7771]"><strong className="text-lg font-semibold text-[#17221e]">{totalSubmissions.toLocaleString()}</strong> submissions in the past year</p>
              <p className="text-xs text-[#6f7771]">Total active days <strong className="ml-1 text-[#17221e]">{activeDays}</strong></p>
              <p className="text-xs text-[#6f7771]">Max streak <strong className="ml-1 text-[#17221e]">{longestStreak} days</strong></p>
              <span className="rounded-md border border-[#dfe1da] bg-[#f7f9f6] px-2.5 py-1 text-xs font-medium text-[#526057]">Current · {currentStreak}d</span>
            </div>

            <div className="mt-4 overflow-x-auto pb-1">
              <div className="min-w-[760px]">
                <div className="flex min-w-0 gap-[3px]">
                  <div className="grid w-6 shrink-0 grid-rows-7 gap-[3px] text-[10px] leading-[10px] text-[#7c847e]">
                    {weekDays.map((day, index) => <span className="h-[11px]" key={index}>{day}</span>)}
                  </div>
                  <div className="grid grid-flow-col grid-rows-7 gap-[3px] [grid-auto-columns:11px]" role="group" aria-label="Submission activity in the past year">
                    {activityDays.map((day) => day.isFuture
                      ? <span className="h-[11px] w-[11px]" key={day.id} aria-hidden="true" />
                      : <span className="h-[11px] w-[11px] rounded-[2px] ring-1 ring-inset ring-black/[.035] transition-transform hover:scale-125" key={day.id} aria-label={day.label} title={day.label} style={{ backgroundColor: activityColors[day.level] }} />)}
                  </div>
                </div>
                <div className="mt-1.5 grid grid-cols-[24px_repeat(53,11px)] gap-x-[3px] text-[10px] text-[#7c847e]">
                  <span />{activityWeeks.map((month, index) => <span className="h-3" key={index}>{month}</span>)}
                </div>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-[#6f7771]">
              <span>{totalSubmissions ? "Each square represents one day. Darker green means more submissions." : "No submissions in the past year yet. Submit a solution to start tracking activity."}</span>
              <Link href="/questions" className="font-semibold text-[#176a5a] underline decoration-[#9ebfb2] underline-offset-4">Browse questions</Link>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
