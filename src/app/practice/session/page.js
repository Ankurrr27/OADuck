import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import AppHeader from "../../components/AppHeader";

export default function PracticeSessionPage() {
  return (
    <main className="inner-page-shell">
      <AppHeader />
      <div className="dashboard-layout inner-page-layout">
        <Sidebar />
        <section className="inner-page-content workspace-page-content">
          <p className="eyebrow">Practice session</p>
          <h1>Ready for your first question?</h1>
          <p className="inner-page-lede">Your selected problem will appear here when the question set is connected.</p>
          <Link className="inner-page-button practice-back-button" href="/practice">Choose another session</Link>
        </section>
      </div>
    </main>
  );
}
