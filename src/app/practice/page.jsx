import Link from "next/link";
import Sidebar from "../components/Sidebar";
import AppHeader from "../components/AppHeader";

export default function PracticePage() {
  return (
    <main className="min-h-screen bg-[#f5f4ef] text-[#17221e]">
      <AppHeader />
      <div className="flex min-h-[calc(100vh-60px)]">
        <Sidebar />
        <section className="w-full max-w-[1280px] flex-1 mx-auto px-[clamp(24px,4vw,56px)] py-12 md:py-16">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-[#a07725]">Practice</p>
          <div className="page-hero relative overflow-hidden rounded-2xl bg-[#123f36] px-6 py-8 text-[#f7f5ed] shadow-[0_18px_40px_rgba(18,63,54,.16)] sm:px-9 sm:py-10">
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[30px] border-[#f5c75d]/15" aria-hidden="true" />
            <div className="relative max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[#f5c75d]">Your next step</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-.045em] sm:text-5xl">A focused hour starts with one good question.</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[#d3e0d8] sm:text-base">Pick a problem, work at your pace, and build the kind of repetition that makes interviews feel familiar.</p>
              <Link className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#f5c75d] px-5 py-2.5 text-sm font-bold text-[#123f36] no-underline transition hover:-translate-y-0.5 hover:bg-[#f8d479]" href="/practice/session">Start a practice session <span aria-hidden="true">→</span></Link>
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <PracticeStat value="0" label="Questions solved" detail="Your first solve starts here" />
            <PracticeStat value="0" label="Sessions completed" detail="Small sessions add up" />
            <PracticeStat value="0 days" label="Current streak" detail="Come back tomorrow" />
          </div>

          <div className="mt-9 grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,.75fr)]">
            <section className="rounded-2xl border border-[#dfe1da] bg-[#fffefa] p-6 shadow-sm sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#a07725]">Recommended</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-.035em]">Start fresh</h2>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-[#6f7771]">We’ll prepare a new problem for this session so you can concentrate on the solution, not the setup.</p>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e8f1eb] text-xl" aria-hidden="true">✦</span>
              </div>
              <div className="mt-6 grid gap-3 border-t border-[#e8ebe5] pt-5 sm:grid-cols-3">
                <SessionRule title="One problem" detail="A single clear goal" />
                <SessionRule title="Your pace" detail="No timer, no pressure" />
                <SessionRule title="Hints on demand" detail="Use them when ready" />
              </div>
              <Link className="mt-6 inline-flex min-h-10 items-center justify-center rounded-lg bg-[#123f36] px-4 py-2 text-sm font-semibold text-[#f7f5ed] no-underline transition hover:bg-[#176a5a]" href="/practice/session">Begin with a new question</Link>
            </section>

            <aside className="rounded-2xl border border-[#dfe1da] bg-[#fffefa] p-6 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#a07725]">In progress</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-.03em]">Your desk is clear.</h2>
              <p className="mt-2 text-sm leading-6 text-[#6f7771]">When you pause a session, it will wait here until you are ready to return.</p>
              <div className="mt-6 rounded-xl border border-dashed border-[#cbd6ce] bg-[#f6f8f4] p-4 text-center">
                <span className="text-2xl" aria-hidden="true">☕</span>
                <p className="mt-2 text-xs font-semibold text-[#526057]">No unfinished sessions</p>
              </div>
              <Link className="mt-5 inline-flex text-sm font-semibold text-[#176a5a] underline decoration-[#a9c8b7] underline-offset-4" href="/questions">Browse the library</Link>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function PracticeStat({ value, label, detail }) {
  return <div className="rounded-xl border border-[#dfe1da] bg-[#fffefa] px-5 py-4 shadow-sm"><p className="text-2xl font-semibold tracking-[-.04em] text-[#123f36]">{value}</p><p className="mt-1 text-sm font-semibold text-[#36433b]">{label}</p><p className="mt-1 text-xs text-[#7b867e]">{detail}</p></div>;
}

function SessionRule({ title, detail }) {
  return <div><p className="text-xs font-bold text-[#36433b]">{title}</p><p className="mt-1 text-xs text-[#7b867e]">{detail}</p></div>;
}
