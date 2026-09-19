import Link from "next/link";
import AppHeader from "./components/AppHeader";
import Sidebar from "./components/Sidebar";
import DuckLoader from "./components/DuckLoader";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#f5f4ef] text-[#17221e]">
      <AppHeader />
      <div className="flex min-h-[calc(100vh-72px)]">
        <Sidebar />
        <section className="flex w-full flex-1 items-center justify-center px-6 py-12">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[#dfe1da] bg-[#fffefa] px-6 py-12 text-center shadow-sm sm:px-12 sm:py-16">
            <div className="absolute left-1/2 top-0 h-44 w-44 -translate-x-1/2 rounded-full bg-[#e8f1eb] blur-3xl" aria-hidden="true" />
            <div className="relative mx-auto w-fit rounded-2xl bg-[#f6f8f4] px-5 py-3"><DuckLoader label="" /></div>
            <p className="relative mt-7 text-xs font-bold uppercase tracking-[.14em] text-[#a07725]">404 · Lost in the reeds</p>
            <h1 className="relative mt-3 text-3xl font-semibold tracking-[-.045em] sm:text-4xl">This page flew away.</h1>
            <p className="relative mx-auto mt-4 max-w-md text-sm leading-6 text-[#6f7771]">The duck you were looking for may have migrated, changed its name, or is temporarily unavailable.</p>
            <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#123f36] px-5 py-2 text-sm font-semibold text-[#f7f5ed] no-underline transition hover:bg-[#176a5a]" href="/practice">Start practicing</Link>
              <Link className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#d5dfd8] bg-[#fffefa] px-5 py-2 text-sm font-semibold text-[#176a5a] no-underline transition hover:bg-[#f4f7f3]" href="/questions">Browse questions</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
