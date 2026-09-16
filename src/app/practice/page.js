import Link from "next/link";
import Sidebar from "../components/Sidebar";
import AppHeader from "../components/AppHeader";

export default function PracticePage() {
  return (
    <main className="inner-page-shell">
      <AppHeader />
      <div className="dashboard-layout inner-page-layout">
        <Sidebar />
        <section className="inner-page-content workspace-page-content">
          <p className="eyebrow">Practice</p>
          <h1>One question at a time.</h1>
          <p className="inner-page-lede">Choose a focused session and work through it at your own pace.</p>
          <div className="option-list">
            <Link className="workspace-option workspace-option-primary" href="/practice/session">
              <span className="card-kicker">Recommended</span>
              <strong>Start a fresh question</strong>
              <span>Get a problem selected for your current practice session.</span>
              <span className="card-arrow" aria-hidden="true">&#8594;</span>
            </Link>
            <div className="workspace-option">
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
