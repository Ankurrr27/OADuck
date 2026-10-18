"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import AppHeader from "../components/AppHeader";
import Sidebar from "../components/Sidebar";
import DuckLoader from "../components/DuckLoader";
import EditProfile from "./EditProfile";

const activityColors = ["#edf0ec", "#d8f2e5", "#9be3bf", "#45bd7d", "#16834c"];
const weekdays = ["Mon", "", "Wed", "", "Fri", "", ""];
const difficulties = [
  { key: "easy", label: "Easy", color: "#00a77a" },
  { key: "medium", label: "Medium", color: "#f59e0b" },
  { key: "hard", label: "Hard", color: "#f0445e" },
];

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function relativeTime(value) {
  const minutes = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 30 ? `${days}d ago` : formatDate(value);
}

function languageName(value) {
  const names = { cpp: "C++", python: "Python", python3: "Python 3", java: "Java", javascript: "JavaScript" };
  return names[value?.toLowerCase()] || value || "Unknown";
}

function StatusCard({ label, value, tone, icon, detail }) {
  const tones = {
    green: "border-emerald-200 text-emerald-700 bg-emerald-50",
    amber: "border-amber-200 text-amber-800 bg-amber-50",
    rose: "border-rose-200 text-rose-700 bg-rose-50",
    slate: "border-slate-200 text-slate-700 bg-slate-50",
  };

  return (
    <article className={`flex min-h-[72px] flex-col justify-between rounded-md border bg-white p-2.5 sm:min-h-[104px] sm:p-4 ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-medium sm:text-[11px]">{label}</span>
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-white/80 text-[10px] sm:h-6 sm:w-6 sm:text-xs" aria-hidden="true">{icon}</span>
      </div>
      <strong className="text-[21px] font-semibold leading-none text-slate-900 sm:text-[26px]">{value.toLocaleString()}</strong>
      <span className="sr-only">{detail}</span>
    </article>
  );
}

function ActivityHeatmap({ days, total, currentStreak, longestStreak }) {
  const weeks = Array.from({ length: 53 }, (_, weekIndex) => days.slice(weekIndex * 7, weekIndex * 7 + 7));
  const mobileWeeks = weeks.slice(-17);
  const monthLabels = weeks.map((week, index) => {
    const date = week[0]?.date ? new Date(`${week[0].date}T00:00:00Z`) : null;
    const previousDate = index > 0 && weeks[index - 1][0]?.date
      ? new Date(`${weeks[index - 1][0].date}T00:00:00Z`)
      : null;
    return date && (!previousDate || previousDate.getUTCMonth() !== date.getUTCMonth())
      ? date.toLocaleDateString(undefined, { month: "short", timeZone: "UTC" })
      : "";
  });
  const mobileMonthLabels = mobileWeeks.map((week, index) => {
    const date = week[0]?.date ? new Date(`${week[0].date}T00:00:00Z`) : null;
    const previousDate = index > 0 && mobileWeeks[index - 1][0]?.date
      ? new Date(`${mobileWeeks[index - 1][0].date}T00:00:00Z`)
      : null;
    return date && (!previousDate || previousDate.getUTCMonth() !== date.getUTCMonth())
      ? date.toLocaleDateString(undefined, { month: "short", timeZone: "UTC" })
      : "";
  });

  return (
    <section className="rounded-md border border-slate-200 bg-white p-3 sm:p-5" aria-labelledby="consistency-heading">
      <div className="hidden flex-wrap items-start justify-between gap-3 sm:flex">
        <div>
          <h2 id="consistency-heading" className="m-0 flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="text-emerald-700" aria-hidden="true">▥</span> CODING CONSISTENCY
            <span className="font-normal text-slate-300">|</span>
            <span className="text-[11px] font-normal text-slate-500">{total.toLocaleString()} submissions in the past year</span>
          </h2>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600">
          <span>Best streak: <strong className="text-slate-900">{longestStreak} days</strong> <span className="text-orange-500" aria-hidden="true">♨</span></span>
          <span>Current streak: <strong className="text-emerald-700">{currentStreak} days</strong> <span className="text-orange-500" aria-hidden="true">↗</span></span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 sm:hidden">
        <div>
          <h2 id="consistency-heading" className="m-0 text-xs font-bold text-slate-900">ACTIVITY CALENDAR</h2>
          <p className="mb-0 mt-1 text-[10px] text-slate-600"><strong className="text-emerald-700">{currentStreak} Day Streak</strong> <span className="text-orange-500" aria-hidden="true">♨</span> | {total.toLocaleString()} submissions</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-semibold ${currentStreak ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}>{currentStreak ? "Active" : "Start today"}</span>
      </div>

      <div className="mt-4 hidden overflow-x-auto pb-2 sm:block" role="group" aria-label="Submission activity by day for the past year">
        <div className="min-w-[740px]">
          <div className="grid grid-cols-[24px_repeat(53,minmax(0,1fr))] gap-x-[3px] text-[9px] text-slate-400">
            <span />
            {monthLabels.map((month, index) => <span className="h-4" key={index}>{month}</span>)}
          </div>
          <div className="grid grid-cols-[24px_repeat(53,minmax(0,1fr))] gap-x-[3px]">
            <div className="grid grid-rows-7 gap-y-[3px] text-[9px] leading-[10px] text-slate-400">
              {weekdays.map((day, index) => <span className="h-[11px]" key={index}>{day}</span>)}
            </div>
            {weeks.map((week, weekIndex) => (
              <div className="grid grid-rows-7 gap-y-[3px]" key={weekIndex}>
                {week.map((day) => day?.future ? (
                  <span className="h-[11px]" key={day.date} aria-hidden="true" />
                ) : (
                  <span
                    className="h-[11px] rounded-[2px] ring-1 ring-inset ring-black/[.04]"
                    key={day?.date || `${weekIndex}-empty`}
                    title={`${day?.date || ""}: ${day?.count || 0} ${day?.count === 1 ? "submission" : "submissions"}`}
                    aria-label={`${day?.date || ""}: ${day?.count || 0} ${day?.count === 1 ? "submission" : "submissions"}`}
                    style={{ backgroundColor: activityColors[day?.level || 0] }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 sm:hidden" role="group" aria-label="Submission activity by day for the past four months">
        <div className="grid grid-cols-[20px_repeat(17,minmax(0,1fr))] gap-x-[3px] text-[8px] text-slate-400">
          <span />
          {mobileMonthLabels.map((month, index) => <span className="h-3" key={index}>{month}</span>)}
        </div>
        <div className="mt-1 grid grid-cols-[20px_repeat(17,minmax(0,1fr))] gap-x-[3px]">
          <div className="grid grid-rows-7 gap-y-[3px] text-[8px] leading-[9px] text-slate-400">
            {weekdays.map((day, index) => <span className="h-[9px]" key={index}>{day}</span>)}
          </div>
          {mobileWeeks.map((week, weekIndex) => (
            <div className="grid grid-rows-7 gap-y-[3px]" key={weekIndex}>
              {week.map((day) => day?.future ? (
                <span className="aspect-square w-full" key={day.date} aria-hidden="true" />
              ) : (
                <span
                  className="aspect-square w-full max-w-[10px] justify-self-center rounded-[2px] ring-1 ring-inset ring-black/[.04]"
                  key={day?.date || `${weekIndex}-empty`}
                  title={`${day?.date || ""}: ${day?.count || 0} ${day?.count === 1 ? "submission" : "submissions"}`}
                  aria-label={`${day?.date || ""}: ${day?.count || 0} ${day?.count === 1 ? "submission" : "submissions"}`}
                  style={{ backgroundColor: activityColors[day?.level || 0] }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-[9px] text-slate-500 sm:mt-0 sm:gap-3 sm:pt-3 sm:text-[10px]">
        <div className="flex items-center gap-1" aria-label="Activity scale: fewer to more submissions">
          <span className="mr-1">Less</span>
          {activityColors.map((color, index) => <span key={color} className="h-3 w-3 rounded-[2px]" style={{ backgroundColor: color }} aria-label={`${index} activity level`} />)}
          <span className="ml-1">More</span>
        </div>
        <span className="hidden sm:inline">{total.toLocaleString()} submissions · {currentStreak} day current streak</span>
        <span className="sm:hidden">Last 4 months</span>
      </div>
    </section>
  );
}

export default function ProfileDashboard() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadDashboard() {
      try {
        const response = await fetch("/api/profile/stats");
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not load your profile.");
        if (!cancelled) {
          setProfile(result.user);
          setStats(result.stats);
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Could not load your profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadDashboard();
    return () => { cancelled = true; };
  }, []);

  if (editing) return <EditProfile onBack={() => setEditing(false)} />;

  const displayName = profile?.name || session?.user?.name || "User";
  const avatar = profile?.image && !imageError;

  return (
    <main className="min-h-screen bg-[#f3f6f4] text-slate-900">
      <AppHeader />
      <div className="flex min-h-[calc(100dvh-3.5rem)]">
        <Sidebar />
        <section className="mx-auto w-full max-w-[1440px] min-w-0 flex-1 px-3 py-4 sm:px-5 sm:py-5 lg:px-7 max-md:p-0">
          {loading ? (
            <div className="grid min-h-60 place-items-center"><DuckLoader label="Loading your profile…" /></div>
          ) : error ? (
            <div className="rounded-md border border-rose-200 bg-white p-5 text-sm text-rose-700" role="alert">{error}</div>
          ) : (
            <div className="grid gap-4 max-md:gap-3 max-md:bg-[linear-gradient(180deg,#103c32_0px,#103c32_280px,#eaf0ed_430px,#eaf0ed_100%)] max-md:pb-6">
              <article className="relative flex flex-col justify-between gap-4 overflow-hidden rounded-md border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(20,55,40,.04)] before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-gradient-to-r before:from-emerald-700 before:via-emerald-400 before:to-emerald-300 sm:flex-row sm:items-center sm:px-5 sm:py-5 max-md:mx-3 max-md:mt-3 max-md:rounded-xl max-md:p-3 max-md:shadow-[0_4px_12px_rgba(14,45,35,.12)] max-md:before:hidden">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4 max-md:block">
                  <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full border-[3px] border-emerald-100 bg-[#103c32] text-lg font-semibold text-white sm:h-16 sm:w-16 max-md:mb-2 max-md:h-12 max-md:w-12 max-md:border-2 max-md:border-emerald-100 max-md:text-lg">
                    {avatar ? <Image className="h-full w-full rounded-full object-cover" src={profile.image} alt="" width={64} height={64} unoptimized onError={() => setImageError(true)} /> : displayName[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h1 className="m-0 truncate text-lg font-bold text-slate-900 sm:text-xl max-md:text-sm">{displayName}</h1>
                      <span className="text-emerald-600" title="Verified profile" aria-label="Verified profile">●</span>
                      {profile?.username && <span className="text-xs text-slate-500 max-md:ml-auto max-md:font-mono max-md:text-[10px] max-md:text-emerald-700">@{profile.username}</span>}
                    </div>
                    <p className="mb-0 mt-1 break-all text-[11px] text-slate-500 max-md:hidden">✉ {profile?.email || session?.user?.email}</p>
                    {profile?.description && <p className="mb-0 mt-3 max-w-xl text-xs leading-5 text-slate-600 max-md:mt-2 max-md:rounded-lg max-md:bg-slate-50 max-md:px-2.5 max-md:py-1.5 max-md:text-[11px] max-md:leading-4 max-md:italic"><span className="mr-1.5 hidden text-base font-bold text-slate-400 max-md:inline" aria-hidden="true">“</span>{profile.description}</p>}
                  </div>
                </div>
                <button className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 self-start rounded-md bg-[#103c32] px-3.5 text-xs font-semibold text-white transition hover:bg-emerald-800 sm:self-center max-md:min-h-8 max-md:w-full max-md:rounded-md max-md:text-[11px]" type="button" onClick={() => setEditing(true)}>
                  <span aria-hidden="true">↗</span> Edit Profile
                </button>
              </article>

              <div className="mx-3 grid grid-cols-1 gap-3 lg:mx-0 lg:grid-cols-[minmax(240px,.8fr)_minmax(0,1.2fr)] max-md:gap-2">
                <article className="rounded-md border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(20,55,40,.04)] sm:p-5 max-md:rounded-lg max-md:p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="mb-1 mt-0 text-xs font-bold uppercase tracking-[.08em] text-slate-400 max-md:text-[9px]">Total solved</p>
                      <div className="flex flex-wrap items-baseline gap-1">
                        <strong className="text-[30px] font-bold leading-none text-slate-900 sm:text-[34px] max-md:text-[24px]">{stats.solvedCount.toLocaleString()}</strong>
                        <span className="text-xs text-slate-500 max-md:text-[10px]">/ {stats.totalQuestions.toLocaleString()} problems</span>
                      </div>
                    </div>
                    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full p-[6px] max-md:h-12 max-md:w-12 max-md:p-[5px]" style={{ background: `conic-gradient(#009f70 ${stats.completionPercent}%, #edf1f5 0)` }} aria-label={`${stats.completionPercent}% completed`}><span className="grid h-full w-full place-items-center rounded-full bg-white text-[11px] font-bold text-slate-800 max-md:text-[9px]">{stats.completionPercent}%</span></div>
                  </div>
                  <div className="mt-5 grid gap-3 max-md:mt-2 max-md:gap-1.5">
                    {difficulties.map(({ key, label, color }) => {
                      const item = stats.difficultyCounts[key];
                      const percent = item.total ? Math.min(100, (item.solved / item.total) * 100) : 0;
                      return (
                        <div key={key}>
                          <div className="mb-1 flex items-center justify-between text-[10px] max-md:mb-0.5 max-md:text-[9px]">
                            <span style={{ color }}>{label}</span>
                            <strong className="text-slate-700">{item.solved.toLocaleString()} / {item.total.toLocaleString()}</strong>
                          </div>
                          <div className="h-[5px] overflow-hidden rounded-full bg-slate-100 max-md:h-1"><span className="block h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: color }} /></div>
                        </div>
                      );
                    })}
                  </div>
                </article>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <StatusCard label="Accepted" value={stats.acceptedCount} tone="green" icon="✓" detail="Accepted submissions" />
                  <StatusCard label="Timeouts (TLE)" value={stats.timeoutCount} tone="amber" icon="◷" detail="Time limit exceeded submissions" />
                  <StatusCard label="Violations" value={stats.violationCount} tone="rose" icon="⚠" detail="Recorded assessment violations" />
                  <StatusCard label="Give Ups" value={stats.giveUpCount} tone="slate" icon="⚑" detail="Completed sessions without an accepted submission" />
                </div>
              </div>

              <div className="mx-4 md:mx-0"><ActivityHeatmap days={stats.activityDays} total={stats.totalSubmissions} currentStreak={stats.currentStreak} longestStreak={stats.longestStreak} /></div>

              <section className="mx-4 overflow-hidden rounded-md border border-slate-200 bg-white md:mx-0" aria-labelledby="recent-heading">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 sm:px-5">
                  <div>
                    <h2 id="recent-heading" className="m-0 text-xs font-bold text-slate-900 sm:text-sm"><span className="mr-2 text-emerald-700" aria-hidden="true">◷</span>Recent Activity</h2>
                    <p className="mb-0 mt-0.5 text-[9px] text-slate-500">Latest code submissions and trials</p>
                  </div>
                  <span className="text-[10px] text-slate-500">{stats.recentSubmissions.length} latest</span>
                </div>
                {stats.recentSubmissions.length ? (
                  <div className="hidden overflow-x-auto sm:block">
                    <table className="w-full min-w-[620px] border-collapse text-left text-[11px]">
                      <thead className="bg-slate-50 text-[9px] uppercase tracking-[.08em] text-slate-500">
                        <tr><th className="px-4 py-3 font-semibold sm:px-5">Problem title</th><th className="px-3 py-3 font-semibold">Difficulty</th><th className="px-3 py-3 font-semibold">Status</th><th className="px-3 py-3 font-semibold">Language</th><th className="px-4 py-3 text-right font-semibold sm:px-5">Submitted</th></tr>
                      </thead>
                      <tbody>
                        {stats.recentSubmissions.map((submission) => (
                          <tr className="border-t border-slate-100" key={submission.id}>
                            <td className="max-w-[260px] truncate px-4 py-3.5 font-medium text-slate-800 sm:px-5">
                              {submission.problem ? <Link href={`/questions/${submission.problem.id}`} className="text-inherit no-underline hover:text-emerald-700">{submission.problem.questionNumber}. {submission.problem.title || "Untitled problem"}</Link> : "Problem unavailable"}
                            </td>
                            <td className="px-3 py-3.5"><span className={`rounded px-1.5 py-1 text-[10px] ${submission.problem?.difficulty?.toLowerCase() === "easy" ? "bg-emerald-50 text-emerald-700" : submission.problem?.difficulty?.toLowerCase() === "hard" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>{submission.problem?.difficulty || "—"}</span></td>
                            <td className="px-3 py-3.5"><span className={`inline-flex rounded-full px-2 py-1 text-[10px] ${submission.status?.toLowerCase() === "accepted" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{submission.status}</span></td>
                            <td className="px-3 py-3.5 text-slate-600">{languageName(submission.language)}</td>
                            <td className="whitespace-nowrap px-4 py-3.5 text-right text-slate-500 sm:px-5">{formatDate(submission.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
                {stats.recentSubmissions.length ? (
                  <div className="divide-y divide-slate-100 sm:hidden">
                    {stats.recentSubmissions.map((submission) => (
                      <article className="px-3 py-2.5" key={`mobile-${submission.id}`}>
                        <div className="flex items-start justify-between gap-2">
                          <Link href={submission.problem ? `/questions/${submission.problem.id}` : "/questions"} className="min-w-0 flex-1 text-[10px] font-semibold leading-4 text-slate-800 no-underline">
                            {submission.problem ? `${submission.problem.questionNumber}. ${submission.problem.title || "Untitled problem"}` : "Problem unavailable"}
                          </Link>
                          <span className={`shrink-0 rounded-full px-2 py-1 text-[8px] font-semibold ${submission.status?.toLowerCase() === "accepted" ? "bg-emerald-50 text-emerald-700" : submission.status?.toLowerCase().includes("time limit") ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>{submission.status}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[8px] text-slate-500">
                          <span className={`rounded border px-1 py-0.5 ${submission.problem?.difficulty?.toLowerCase() === "easy" ? "border-emerald-200 text-emerald-700" : submission.problem?.difficulty?.toLowerCase() === "hard" ? "border-rose-200 text-rose-700" : "border-amber-200 text-amber-700"}`}>{submission.problem?.difficulty || "—"}</span>
                          <span className="rounded border border-slate-200 px-1 py-0.5">{languageName(submission.language)}</span>
                          <span>{relativeTime(submission.createdAt)}</span>
                          {submission.runtimeMs != null && <span className="ml-auto">{submission.runtimeMs.toLocaleString()} ms</span>}
                        </div>
                      </article>
                    ))}
                  </div>
                ) : <p className="m-0 px-4 py-8 text-center text-xs text-slate-500">Your submissions will appear here.</p>}
              </section>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}