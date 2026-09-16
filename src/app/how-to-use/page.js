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
    <main className="inner-page-shell">
      <AppHeader />
      <div className="dashboard-layout inner-page-layout">
        <Sidebar />
        <section className="inner-page-content workspace-page-content">
          <p className="eyebrow">How to use OA Duck</p>
          <h1>A simple practice loop.</h1>
          <p className="inner-page-lede">Keep sessions focused, thoughtful, and easy to return to.</p>
          <div className="guide-list">
            {steps.map(([number, title, description]) => (
              <div className="guide-row" key={number}>
                <span className="guide-number">{number}</span>
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
