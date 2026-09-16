import Link from "next/link";
import Sidebar from "../components/Sidebar";
import AppHeader from "../components/AppHeader";

const questionTopics = [
  ["Arrays & strings", "Build confidence with the fundamentals."],
  ["Trees & graphs", "Practice structured problem solving."],
  ["Dynamic programming", "Work through patterns step by step."],
];

export default function QuestionsPage() {
  return (
    <main className="inner-page-shell">
      <AppHeader />
      <div className="dashboard-layout inner-page-layout">
        <Sidebar />
        <section className="inner-page-content workspace-page-content">
          <p className="eyebrow">Question library</p>
          <h1>Find your next challenge.</h1>
          <p className="inner-page-lede">Browse topics and build a practice routine that feels manageable.</p>
          <div className="option-list">
            {questionTopics.map(([title, description]) => (
              <button className="workspace-option" type="button" key={title}>
                <span className="card-kicker">Topic</span>
                <strong>{title}</strong>
                <span>{description}</span>
                <span className="card-arrow" aria-hidden="true">&#8594;</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
