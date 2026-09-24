"use client";

import { useSession } from "next-auth/react";
import AppHeader from "./components/AppHeader";
import AuthForm from "./components/AuthForm";
import Sidebar from "./components/Sidebar";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "authenticated") {
    return <Dashboard user={session.user} />;
  }

  return <AuthForm initialMode="login" />;
}

function Dashboard({ user }) {
  const firstName = user.name?.split(" ")[0] || "there";

  return (
    <main className="min-h-screen bg-[#f5f4ef] text-[#17221e]">
      <AppHeader />
      <div className="flex min-h-[calc(100vh-60px)]">
        <Sidebar />
        <section className="mx-auto w-full max-w-[1440px] flex-1 px-[clamp(20px,3vw,40px)] py-7">
          <div className="flex items-end justify-between gap-7 max-md:block">
            <div>
              <h1 className="text-[clamp(26px,3vw,36px)] font-medium tracking-[-.05em] leading-tight">Good to see you, {firstName}.</h1>
              <p className="mt-1.5 text-sm text-[#6f7771]">Choose a practice path and keep your problem-solving momentum going.</p>
            </div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-[#dfe1da] bg-[#fffefa] px-3 py-2 text-[11px] text-[#6f7771]"><span className="h-1.5 w-1.5 rounded-full bg-[#61a875]" /><span>{user.email}</span></div>
          </div>
          <div className="mt-7 grid grid-cols-3 gap-3 max-md:grid-cols-1">
            <button className="relative flex min-h-36 flex-col items-start rounded-md border border-[#123f36] bg-[#123f36] p-4 text-left text-[#f7f5ed] transition hover:bg-[#164b40]" type="button"><span className="mb-4 text-[10px] font-bold uppercase tracking-[.12em] text-[#f5c75d]">Start here</span><strong className="text-base font-semibold tracking-tight">Practice a question</strong><span className="mt-1.5 max-w-48 text-xs leading-5 text-[#bdcbc3]">Work through a fresh problem at your pace.</span><span className="absolute right-4 bottom-3 text-lg" aria-hidden="true">&#8594;</span></button>
            <button className="relative flex min-h-36 flex-col items-start rounded-md border border-[#dfe1da] bg-[#fffefa] p-4 text-left transition hover:border-[#b6cbbd]" type="button"><span className="mb-4 text-[10px] font-bold uppercase tracking-[.12em] text-[#a07725]">Browse</span><strong className="text-base font-semibold tracking-tight">Question library</strong><span className="mt-1.5 max-w-48 text-xs leading-5 text-[#6f7771]">Explore curated questions and build a routine.</span><span className="absolute right-4 bottom-3 text-lg" aria-hidden="true">&#8594;</span></button>
            <div className="flex min-h-36 flex-col rounded-md border border-[#dfe1da] bg-[#fffefa] p-4"><span className="mb-4 text-[10px] font-bold uppercase tracking-[.12em] text-[#a07725]">Your progress</span><strong className="text-base font-semibold tracking-tight">Ready when you are</strong><span className="mt-1.5 max-w-48 text-xs leading-5 text-[#6f7771]">Complete your first session to see your stats here.</span><div className="mt-auto h-1 w-full rounded bg-[#e8e9e2]"><span className="block h-full w-[3%] rounded bg-[#f5c75d]" /></div></div>
          </div>
        </section>
      </div>
    </main>
  );
}
