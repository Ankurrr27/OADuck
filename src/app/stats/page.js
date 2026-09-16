import Link from "next/link";
import Sidebar from "../components/Sidebar";
import AppHeader from "../components/AppHeader";

const stats = [
  ["Sessions", "0"],
  ["Questions solved", "0"],
  ["Current streak", "0 days"],
];

export default function StatsPage() {
  return (
    <main className="inner-page-shell">
      <AppHeader />
      <div className="dashboard-layout inner-page-layout">
        <Sidebar />
        <section className="inner-page-content stats-page-content">
        <p className="eyebrow">Your stats</p>
        <h1>Keep building momentum.</h1>
        <p className="inner-page-lede">Your practice history will appear here after your first session.</p>
        <div className="stats-list">
          {stats.map(([label, value]) => (
            <div className="stats-list-row" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        </section>
      </div>
    </main>
  );
}
