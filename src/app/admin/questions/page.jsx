"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppHeader from "../../components/AppHeader";
import Sidebar from "../../components/Sidebar";
import PageLoader from "../../components/PageLoader";

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
    <main className="min-h-screen bg-[#f5f4ef] text-[#17221e]">
      <AppHeader />
      <div className="flex min-h-[calc(100vh-60px)] ">
        <Sidebar />
        <section className="w-full max-w-[900px] flex-1 mx-auto px-[clamp(24px,4vw,56px)] py-19 max-w-[1120px]">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-[#a07725]">
            <Link href="/admin" style={{ textDecoration: "none", color: "inherit" }}>&larr; Back to Admin</Link>
          </p>
          
          <div className="flex items-end justify-between gap-6" style={{ marginBottom: "2rem" }}>
            <div>
              <h1>Manage Questions</h1>
              <p className="mt-4 text-sm text-[#6f7771]">View, edit, and remove questions from the library.</p>
            </div>
            <Link href="/admin/questions/new" className="inline-flex min-h-10 items-center justify-center rounded-md border-0 bg-[#123f36] px-4 py-2 text-[13px] font-semibold text-[#f7f5ed] no-underline disabled:cursor-wait disabled:opacity-65" style={{ textDecoration: "none", margin: 0 }}>+ Add Question</Link>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <input 
              type="text" 
              placeholder="Search by title or topic..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-h-10 w-full rounded-md border border-[#d7dad3] bg-[#fffefa] px-3 text-[13px] outline-none focus:border-[#7c9b8d] focus:ring-3 focus:ring-[#123f36]/10"
              style={{ maxWidth: "400px", margin: 0 }}
            />
          </div>

          {loading ? (
            <PageLoader />
          ) : filteredQuestions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <p>No questions found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#dfe1da] bg-white">
              <table className="w-full border-collapse text-[.9rem] [&_thead]:bg-[#fafaf7] [&_th]:border-b [&_th]:border-[#dfe1da] [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:text-[.78rem] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[.04em] [&_th]:text-[#6f7771] [&_td]:border-b [&_td]:border-[#f0efe8] [&_td]:px-4 [&_td]:py-3 [&_td]:align-middle [&_a]:font-semibold [&_a]:text-[#17221e] [&_a]:no-underline">
                <thead>
                  <tr>
                    <th className="w-12.5">#</th>
                    <th>Title</th>
                    <th>Difficulty</th>
                    <th>Source</th>
                    <th style={{ width: "150px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestions.map((q) => (
                    <tr key={q.id} className="transition-colors hover:bg-[#f8f7f2]">
                      <td className="font-semibold tabular-nums text-[#6f7771]">{q.questionNumber}</td>
                      <td className="font-semibold text-[#17221e]">
                        <Link href={`/questions/${q.id}`} target="_blank">{q.title || "Untitled"}</Link>
                      </td>
                      <td>
                        <span className="inline-block rounded-full px-2.5 py-0.5 text-[.78rem] font-semibold" style={{ background: `${difficultyColor[q.difficulty]}18`, color: difficultyColor[q.difficulty], margin: 0 }}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="text-center">
                        {q.source === "leetcode" ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#ffa1161a] text-[.7rem] font-bold text-[#ffa116]">LC</span>
                        ) : (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#123f36]/10 text-[.7rem] font-bold text-[#123f36]">OA</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <Link 
                            href={`/admin/questions/${q.id}/edit`}
                            className="inline-flex min-h-10 items-center justify-center rounded-md border-0 bg-[#123f36] px-4 py-2 text-[13px] font-semibold text-[#f7f5ed] no-underline disabled:cursor-wait disabled:opacity-65"
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
                            className="inline-flex min-h-10 items-center justify-center rounded-md border-0 bg-[#123f36] px-4 py-2 text-[13px] font-semibold text-[#f7f5ed] no-underline disabled:cursor-wait disabled:opacity-65"
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
