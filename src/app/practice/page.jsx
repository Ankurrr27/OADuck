import Link from "next/link";
import Sidebar from "../components/Sidebar";
import AppHeader from "../components/AppHeader";

export default function PracticePage() {
  return (
    <main className="min-h-screen bg-[#f5f4ef] text-[#17221e]">
      <AppHeader />
      <div className="flex min-h-[calc(100vh-60px)] ">
        <Sidebar />
        <section className="w-full max-w-[1200px] flex-1 mx-auto px-[clamp(24px,4vw,56px)] py-19 workspace-page-content">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-[#a07725]">Practice</p>
          <h1>One question at a time.</h1>
          <p className="mt-4 text-sm text-[#6f7771]">Choose a focused session and work through it at your own pace.</p>
          <div className="mt-10 grid max-w-[700px] gap-3.5">
            <Link className="relative flex min-h-36 flex-col items-start rounded-lg border border-[#dfe1da] bg-[#fffefa] p-5.5 text-left no-underline [&_strong]:text-lg [&_strong]:font-semibold [&_strong]:tracking-tight [&_span:not(:first-child)]:mt-2 [&_span:not(:first-child)]:text-xs [&_span:not(:first-child)]:leading-5 [&_span:not(:first-child)]:text-[#6f7771] border-[#123f36] bg-[#123f36] text-[#f7f5ed]" href="/practice/session">
              <span className="card-kicker">Recommended</span>
              <strong>Start a fresh question</strong>
              <span>Get a problem selected for your current practice session.</span>
              <span className="card-arrow" aria-hidden="true">&#8594;</span>
            </Link>
            <div className="relative flex min-h-36 flex-col items-start rounded-lg border border-[#dfe1da] bg-[#fffefa] p-5.5 text-left no-underline [&_strong]:text-lg [&_strong]:font-semibold [&_strong]:tracking-tight [&_span:not(:first-child)]:mt-2 [&_span:not(:first-child)]:text-xs [&_span:not(:first-child)]:leading-5 [&_span:not(:first-child)]:text-[#6f7771]">
              <span className="card-kicker">Coming next</span>
              <strong>Continue a session</strong>
              <span>Your unfinished sessions will appear here.</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
