import Link from "next/link";
import Sidebar from "../components/Sidebar";
import AppHeader from "../components/AppHeader";

const steps = [
  ["01", "Choose a question", "Start from Practice or browse the Question Library by topic."],
  ["02", "Think it through", "Work at your own pace and use hints only when you need a nudge."],
  ["03", "Review your progress", "Visit Stats after each session to keep your routine visible."],
];

export default function HowToUsePage() {
  return (
    <main className="min-h-screen bg-[#f5f4ef] text-[#17221e]">
      <AppHeader />
      <div className="flex min-h-[calc(100vh-60px)] ">
        <Sidebar />
        <section className="w-full max-w-[1200px] flex-1 mx-auto px-[clamp(24px,4vw,56px)] py-19 workspace-page-content">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-[#a07725]">How to use OA Duck</p>
          <h1>A simple practice loop.</h1>
          <p className="mt-4 text-sm text-[#6f7771]">Keep sessions focused, thoughtful, and easy to return to.</p>
          <div className="mt-10 max-w-[700px] border-t border-[#dfe1da] [&_strong]:text-base [&_strong]:font-semibold [&_strong]:text-[#17221e] [&_p]:mt-2 [&_p]:text-[13px] [&_p]:leading-5 [&_p]:text-[#6f7771]">
            {steps.map(([number, title, description]) => (
              <div className="grid grid-cols-[42px_1fr] gap-4.5 border-b border-[#dfe1da] py-5.5" key={number}>
                <span className="text-xs font-bold tracking-[.1em] text-[#a07725]">{number}</span>
                <div>
                  <strong>{title}</strong>
                  <p>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
