import Link from "next/link";
import Sidebar from "../components/Sidebar";
import AppHeader from "../components/AppHeader";

const steps = [
  ["01", "Choose a question", "Begin in Practice for a focused prompt, or browse the library when you want to choose the topic yourself.", "Explore questions", "/questions"],
  ["02", "Give yourself room to think", "Work at your own pace. Start with your first idea, then use hints only when they help you move forward.", "Start practicing", "/practice"],
  ["03", "Return and reflect", "Review your progress after a session. Small, consistent returns are what make your confidence compound.", "View your stats", "/stats"],
];

export default function HowToUsePage() {
  return (
    <main className="min-h-screen bg-[#f5f4ef] text-[#17221e]">
      <AppHeader />
      <div className="flex min-h-[calc(100vh-60px)]">
        <Sidebar />
        <section className="w-full max-w-[1280px] flex-1 mx-auto px-[clamp(24px,4vw,56px)] py-12 md:py-16">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-[#a07725]">How to use OA Duck</p>
          <div className="page-hero relative overflow-hidden rounded-2xl bg-[#123f36] px-6 py-9 text-[#f7f5ed] shadow-[0_18px_40px_rgba(18,63,54,.16)] sm:px-9 sm:py-12">
            <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full border-[28px] border-[#f5c75d]/15" aria-hidden="true" />
            <div className="relative max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#f5c75d]">A simple practice loop</p><h1 className="mt-3 text-3xl font-semibold tracking-[-.045em] sm:text-5xl">Think deeply. Return often.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-[#d3e0d8] sm:text-base">OA Duck is designed to make interview preparation feel lighter: choose one question, give it your attention, and come back tomorrow.</p></div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {steps.map(([number, title, description, action, href]) => <article className="relative overflow-hidden rounded-2xl border border-[#dfe1da] bg-[#fffefa] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md" key={number}>
              <span className="absolute right-5 top-4 text-5xl font-semibold tracking-[-.08em] text-[#e8f1eb]" aria-hidden="true">{number}</span>
              <span className="relative grid h-9 w-9 place-items-center rounded-lg bg-[#e8f1eb] text-xs font-bold text-[#176a5a]">{number}</span>
              <h2 className="relative mt-6 text-xl font-semibold tracking-[-.03em]">{title}</h2>
              <p className="relative mt-3 min-h-18 text-sm leading-6 text-[#6f7771]">{description}</p>
              <Link className="relative mt-6 inline-flex text-sm font-semibold text-[#176a5a] no-underline underline decoration-[#aac8b8] underline-offset-4 hover:text-[#123f36]" href={href}>{action} →</Link>
            </article>)}
          </div>

          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-[#dfe1da] bg-[#fffefa] p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#a07725]">A helpful rule</p><h2 className="mt-2 text-xl font-semibold tracking-[-.03em]">Aim for progress, not perfect answers.</h2><p className="mt-2 text-sm leading-6 text-[#6f7771]">A half-solved problem with a clear reflection can teach more than a rushed solution.</p></div>
            <Link className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-[#123f36] px-5 py-2 text-sm font-semibold text-[#f7f5ed] no-underline transition hover:bg-[#176a5a]" href="/practice">Start your first session</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
