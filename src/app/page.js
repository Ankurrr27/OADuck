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
    <main className="dashboard-shell">
      <AppHeader />
      <div className="dashboard-layout">
        <Sidebar />
        <section className="dashboard-content">
          <div className="dashboard-intro">
            <div>
              <p className="eyebrow">Your workspace</p>
              <h1>Good to see you, {firstName}.</h1>
              <p>Choose a practice path and keep your problem-solving momentum going.</p>
            </div>
            <div className="account-chip"><span className="status-dot" /><span>{user.email}</span></div>
          </div>
          <div className="dashboard-grid">
            <button className="dashboard-card dashboard-card-primary" type="button"><span className="card-kicker">Start here</span><strong>Practice a question</strong><span>Work through a fresh problem at your pace.</span><span className="card-arrow" aria-hidden="true">&#8594;</span></button>
            <button className="dashboard-card" type="button"><span className="card-kicker">Browse</span><strong>Question library</strong><span>Explore curated questions and build a routine.</span><span className="card-arrow" aria-hidden="true">&#8594;</span></button>
            <div className="progress-card"><span className="card-kicker">Your progress</span><strong>Ready when you are</strong><span>Complete your first session to see your stats here.</span><div className="progress-bar"><span /></div></div>
          </div>
        </section>
      </div>
    </main>
  );
}
