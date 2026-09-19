import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import AppHeader from "../../components/AppHeader";

export default function PracticeSessionPage() {
  return (
    <main className="min-h-screen bg-[#f5f4ef] text-[#17221e]">
      <AppHeader />
      <div className="flex min-h-[calc(100vh-60px)] ">
        <Sidebar />
        <section className="w-full max-w-[1200px] flex-1 mx-auto px-[clamp(24px,4vw,56px)] py-19 workspace-page-content">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-[#a07725]">Practice session</p>
          <h1>Ready for your first question?</h1>
          <p className="mt-4 text-sm text-[#6f7771]">Your selected problem will appear here when the question set is connected.</p>
          <Link className="inline-flex min-h-10 items-center justify-center rounded-md border-0 bg-[#123f36] px-4 py-2 text-[13px] font-semibold text-[#f7f5ed] no-underline disabled:cursor-wait disabled:opacity-65 mt-9 w-fit px-4.5 no-underline" href="/practice">Choose another session</Link>
        </section>
      </div>
    </main>
  );
}
