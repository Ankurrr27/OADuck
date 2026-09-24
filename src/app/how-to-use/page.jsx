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
        <section className="w-full max-w-[1440px] flex-1 mx-auto px-[clamp(20px,3vw,40px)] py-7">
          <div className="page-hero relative overflow-hidden rounded-md bg-[#123f36] px-5 py-5 text-[#f7f5ed] sm:px-6 sm:py-6">
            <div className="relative max-w-2xl"><p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#f5c75d]">How to use OA Duck</p><h1 className="mt-1.5 text-2xl font-semibold tracking-[-.04em] sm:text-3xl">Think deeply. Return often.</h1><p className="mt-2 max-w-xl text-sm leading-5 text-[#d3e0d8]">Choose one question, give it your attention, and come back tomorrow.</p></div>
          </div>

          <div className="mt-4 grid gap-2 lg:grid-cols-3">
            {steps.map(([number, title, description, action, href]) => <article className="relative overflow-hidden rounded-md border border-[#dfe1da] bg-[#fffefa] p-4 transition hover:border-[#b6cbbd]" key={number}>
              <span className="text-[11px] font-bold tracking-[.08em] text-[#176a5a]">{number}</span>
              <h2 className="mt-1.5 text-base font-semibold tracking-[-.02em]">{title}</h2>
              <p className="mt-1.5 min-h-12 text-xs leading-5 text-[#6f7771]">{description}</p>
              <Link className="mt-3 inline-flex text-xs font-semibold text-[#176a5a] no-underline underline decoration-[#aac8b8] underline-offset-4 hover:text-[#123f36]" href={href}>{action} →</Link>
            </article>)}
          </div>

          <div className="mt-3 flex flex-col gap-3 rounded-md border border-[#dfe1da] bg-[#fffefa] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-base font-semibold tracking-[-.02em]">Aim for progress, not perfect answers.</h2><p className="mt-1 text-xs leading-5 text-[#6f7771]">A half-solved problem with a clear reflection can teach more than a rushed solution.</p></div>
            <Link className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-md bg-[#123f36] px-3.5 py-2 text-xs font-semibold text-[#f7f5ed] no-underline transition hover:bg-[#176a5a]" href="/practice">Start practicing</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
