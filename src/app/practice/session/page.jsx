import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import AppHeader from "../../components/AppHeader";

export default function PracticeSessionPage() {
  return (
    <main className="min-h-screen bg-[#f5f4ef] text-[#17221e]">
      <AppHeader />
      <div className="flex min-h-[calc(100vh-60px)]">
        <Sidebar />
        <section className="flex w-full max-w-[1280px] flex-1 mx-auto items-center px-[clamp(24px,4vw,56px)] py-12 md:py-16">
          <div className="w-full overflow-hidden rounded-2xl border border-[#dfe1da] bg-[#fffefa] shadow-sm">
            <div className="border-b border-[#dfe1da] bg-[#f8faf7] px-6 py-4 sm:px-8"><Link className="text-xs font-semibold text-[#176a5a] no-underline hover:underline" href="/practice">← Back to practice</Link></div>
            <div className="relative px-6 py-14 text-center sm:px-12 sm:py-20">
              <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-[#e8f1eb] blur-2xl" aria-hidden="true" />
              <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#123f36] text-3xl shadow-lg" aria-hidden="true">✦</div>
              <p className="relative mt-7 text-xs font-bold uppercase tracking-[.13em] text-[#a07725]">Practice session</p>
              <h1 className="relative mt-3 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">Choose a problem to begin your practice session.</h1>
              <p className="relative mx-auto mt-4 max-w-lg text-sm leading-6 text-[#6f7771]">When you open a problem, you’ll first see the session rules and full-screen requirement. Your monitored session begins after you review the rules.</p>
              <div className="relative mx-auto mt-8 grid max-w-md gap-3 text-left sm:grid-cols-2"><div className="rounded-xl bg-[#f4f7f3] p-4"><p className="text-xs font-bold text-[#36433b]">While you wait</p><p className="mt-1 text-xs leading-5 text-[#6f7771]">Browse the library and choose a problem that looks interesting.</p></div><div className="rounded-xl bg-[#f4f7f3] p-4"><p className="text-xs font-bold text-[#36433b]">A good session</p><p className="mt-1 text-xs leading-5 text-[#6f7771]">Start with the problem, then reach for hints only when needed.</p></div></div>
              <Link className="relative mt-8 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#123f36] px-5 py-2 text-sm font-semibold text-[#f7f5ed] no-underline transition hover:bg-[#176a5a]" href="/questions">Choose a problem</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
