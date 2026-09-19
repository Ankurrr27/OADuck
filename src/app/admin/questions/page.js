"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppHeader from "../../components/AppHeader";
import Sidebar from "../../components/Sidebar";

const difficultyColor = {
  Easy: "#22c55e",
  Medium: "#f59e0b",
  Hard: "#ef4444",
};

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch("/api/questions");
        const data = await res.json();
        if (data.success) {
          setQuestions(data.questions);
        }
      } catch (err) {
        console.error("Failed to fetch questions");
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  async function deleteQuestion(id, title) {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/questions/${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (data.success) {
        setQuestions(questions.filter(q => q.id !== id));
      } else {
        alert(data.error || "Failed to delete question");
      }
    } catch (err) {
      alert("An error occurred");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredQuestions = questions.filter(q => 
    (q.title || "").toLowerCase().includes(search.toLowerCase()) || 
    (q.topics || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <main className="inner-page-shell">
      <AppHeader />
      <div className="dashboard-layout inner-page-layout">
        <Sidebar />
        <section className="inner-page-content admin-page-content">
          <p className="eyebrow">
            <Link href="/admin" style={{ textDecoration: "none", color: "inherit" }}>&larr; Back to Admin</Link>
          </p>
          
          <div className="admin-heading-row" style={{ marginBottom: "2rem" }}>
            <div>
              <h1>Manage Questions</h1>
              <p className="inner-page-lede">View, edit, and remove questions from the library.</p>
            </div>
            <Link href="/admin/questions/new" className="inner-page-button" style={{ textDecoration: "none", margin: 0 }}>+ Add Question</Link>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <input 
              type="text" 
              placeholder="Search by title or topic..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="auth-input"
              style={{ maxWidth: "400px", margin: 0 }}
            />
          </div>

          {loading ? (
            <div className="q-loading">
              <div className="q-loading-spinner" />
              <span>Loading questions...</span>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="q-empty">
              <p>No questions found.</p>
            </div>
          ) : (
            <div className="q-table-wrap">
              <table className="q-table">
                <thead>
                  <tr>
                    <th className="q-th-num">#</th>
                    <th>Title</th>
                    <th>Difficulty</th>
                    <th>Source</th>
                    <th style={{ width: "150px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestions.map((q) => (
                    <tr key={q.id} className="q-row">
                      <td className="q-cell-num">{q.questionNumber}</td>
                      <td className="q-cell-title">
                        <Link href={`/questions/${q.id}`} target="_blank">{q.title || "Untitled"}</Link>
                      </td>
                      <td>
                        <span className="q-diff-badge" style={{ background: `${difficultyColor[q.difficulty]}18`, color: difficultyColor[q.difficulty], margin: 0 }}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="q-cell-source">
                        {q.source === "leetcode" ? (
                          <span className="q-source-lc">LC</span>
                        ) : (
                          <span className="q-source-int">OA</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <Link 
                            href={`/admin/questions/${q.id}/edit`}
                            className="inner-page-button"
                            style={{ 
                              padding: "0.3rem 0.6rem", 
                              fontSize: "0.75rem", 
                              margin: 0, 
                              background: "transparent", 
                              border: "1px solid var(--line)", 
                              color: "var(--ink)",
                              textDecoration: "none"
                            }}
                          >
                            Edit
                          </Link>
                          
                          <button 
                            className="inner-page-button"
                            style={{ 
                              padding: "0.3rem 0.6rem", 
                              fontSize: "0.75rem", 
                              margin: 0, 
                              background: "transparent", 
                              border: "1px solid #ffcdd2", 
                              color: "#d32f2f",
                              opacity: deletingId === q.id ? 0.5 : 1
                            }}
                            onClick={() => deleteQuestion(q.id, q.title)}
                            disabled={deletingId === q.id}
                          >
                            Delete
                          </button>
                        </div>
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
