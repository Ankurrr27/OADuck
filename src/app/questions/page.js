"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Sidebar from "../components/Sidebar";
import AppHeader from "../components/AppHeader";

const difficultyColor = {
  Easy: "#22c55e",
  Medium: "#f59e0b",
  Hard: "#ef4444",
};

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch("/api/questions");
        const data = await res.json();
        if (data.success) {
          setQuestions(data.questions);
        }
      } catch (err) {
        console.error("Failed to fetch questions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  const filtered = filter === "All" ? questions : questions.filter(q => q.difficulty === filter);

  return (
    <main className="inner-page-shell">
      <AppHeader />
      <div className="dashboard-layout inner-page-layout">
        <Sidebar />
        <section className="inner-page-content workspace-page-content">
          <p className="eyebrow">Question library</p>
          <h1>Find your next challenge.</h1>
          <p className="inner-page-lede">Browse problems imported into OA Duck and start practicing.</p>

          {/* Difficulty Filter */}
          <div className="q-filters">
            {["All", "Easy", "Medium", "Hard"].map((f) => (
              <button
                key={f}
                className={`q-filter-btn ${filter === f ? "q-filter-active" : ""}`}
                onClick={() => setFilter(f)}
                type="button"
              >
                {f === "All" ? "All" : (
                  <>
                    <span className="q-diff-dot" style={{ background: difficultyColor[f] }} />
                    {f}
                  </>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="q-loading">
              <div className="q-loading-spinner" />
              <span>Loading questions...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="q-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9 9h.01M15 9h.01M8 14s1.5 2 4 2 4-2 4-2"/>
              </svg>
              <p>No questions yet.</p>
              <span>Import a problem from LeetCode to get started.</span>
            </div>
          ) : (
            <div className="q-table-wrap">
              <table className="q-table">
                <thead>
                  <tr>
                    <th className="q-th-num">#</th>
                    <th>Title</th>
                    <th>Difficulty</th>
                    <th>Topics</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((q) => (
                    <tr key={q.id} className="q-row">
                      <td className="q-cell-num">{q.questionNumber}</td>
                      <td className="q-cell-title">
                        <Link href={`/questions/${q.id}`}>{q.title || "Untitled"}</Link>
                      </td>
                      <td>
                        <span className="q-diff-badge" style={{ background: `${difficultyColor[q.difficulty]}18`, color: difficultyColor[q.difficulty] }}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="q-cell-topics">
                        {q.topics && q.topics.length > 0 ? (
                          q.topics.slice(0, 3).map((t) => (
                            <span className="q-topic-chip" key={t}>{t}</span>
                          ))
                        ) : (
                          <span style={{ color: "var(--muted)" }}>—</span>
                        )}
                        {q.topics && q.topics.length > 3 && (
                          <span className="q-topic-chip q-topic-more">+{q.topics.length - 3}</span>
                        )}
                      </td>
                      <td className="q-cell-source">
                        {q.source === "leetcode" ? (
                          <span className="q-source-lc">LC</span>
                        ) : (
                          <span className="q-source-int">OA</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
