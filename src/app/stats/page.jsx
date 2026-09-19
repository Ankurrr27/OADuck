import Link from "next/link";
import Sidebar from "../components/Sidebar";
import AppHeader from "../components/AppHeader";

const metrics = [
  { label: "Questions solved", value: "0", detail: "Complete a problem to begin" },
  { label: "Practice sessions", value: "0", detail: "Your focused sessions appear here" },
  { label: "Current streak", value: "0 days", detail: "Practice on consecutive days" },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const activityDays = Array.from({ length: 84 }, (_, index) => ({ id: index, label: "No activity recorded" }));

export default function StatsPage() {
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

          <div className="mt-12 grid grid-cols-3 gap-3 max-lg:grid-cols-1">
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
              <div className="grid min-w-[530px] grid-flow-col grid-rows-7 gap-1" role="img" aria-label="No practice activity recorded in the last 12 weeks">
                {activityDays.map((day) => (
                  <span className="h-3 w-3 rounded-[3px] bg-[#edf0ec]" key={day.id} aria-label={day.label} />
                ))}
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[#e7e9e4] pt-5 text-sm text-[#6f7771]">
              <span>No activity yet — your first session will light up the calendar.</span>
              <Link href="/questions" className="font-semibold text-[#176a5a] underline decoration-[#9ebfb2] underline-offset-4">Browse questions</Link>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
