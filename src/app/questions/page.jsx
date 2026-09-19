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
    <main className="min-h-screen bg-[#f5f4ef] text-[#17221e]">
      <AppHeader />
      <div className="flex min-h-[calc(100vh-60px)] ">
        <Sidebar />
        <section className="w-full max-w-[1200px] flex-1 mx-auto px-[clamp(24px,4vw,56px)] py-19 workspace-page-content">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-[#a07725]">Question library</p>
          <h1>Find your next challenge.</h1>
          <p className="mt-4 text-sm text-[#6f7771]">Browse problems imported into OA Duck and start practicing.</p>

          {/* Difficulty Filter */}
          <div className="my-6 flex flex-wrap gap-2">
            {["All", "Easy", "Medium", "Hard"].map((f) => (
              <button
                key={f}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#dfe1da] bg-transparent px-4 py-1.5 text-[.85rem] font-medium text-[#6f7771] hover:border-[#123f36] hover:text-[#17221e] ${filter === f ? "border-[#123f36] bg-[#123f36] text-white" : ""}`}
                onClick={() => setFilter(f)}
                type="button"
              >
                {f === "All" ? "All" : (
                  <>
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: difficultyColor[f] }} />
                    {f}
                  </>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center gap-4 py-16 text-[#6f7771]">
              <div className="flex flex-col items-center gap-4 py-16 text-[#6f7771]-spinner" />
              <span>Loading questions...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9 9h.01M15 9h.01M8 14s1.5 2 4 2 4-2 4-2"/>
              </svg>
              <p>No questions yet.</p>
              <span>Import a problem from LeetCode to get started.</span>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#dfe1da] bg-white">
              <table className="w-full border-collapse text-[.9rem] [&_thead]:bg-[#fafaf7] [&_th]:border-b [&_th]:border-[#dfe1da] [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:text-[.78rem] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[.04em] [&_th]:text-[#6f7771] [&_td]:border-b [&_td]:border-[#f0efe8] [&_td]:px-4 [&_td]:py-3 [&_td]:align-middle [&_a]:font-semibold [&_a]:text-[#17221e] [&_a]:no-underline">
                <thead>
                  <tr>
                    <th className="w-12.5">#</th>
                    <th>Title</th>
                    <th>Difficulty</th>
                    <th>Topics</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((q) => (
                    <tr key={q.id} className="transition-colors hover:bg-[#f8f7f2]">
                      <td className="font-semibold tabular-nums text-[#6f7771]">{q.questionNumber}</td>
                      <td className="font-semibold text-[#17221e]">
                        <Link href={`/questions/${q.id}`}>{q.title || "Untitled"}</Link>
                      </td>
                      <td>
                        <span className="inline-block rounded-full px-2.5 py-0.5 text-[.78rem] font-semibold" style={{ background: `${difficultyColor[q.difficulty]}18`, color: difficultyColor[q.difficulty] }}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="flex flex-wrap items-center gap-1.5">
                        {q.topics && q.topics.length > 0 ? (
                          q.topics.slice(0, 3).map((t) => (
                            <span className="inline-block whitespace-nowrap rounded-full bg-[#f0efe8] px-2.5 py-0.5 text-xs font-medium text-[#6f7771]" key={t}>{t}</span>
                          ))
                        ) : (
                          <span style={{ color: "var(--muted)" }}>—</span>
                        )}
                        {q.topics && q.topics.length > 3 && (
                          <span className="inline-block whitespace-nowrap rounded-full bg-[#f0efe8] px-2.5 py-0.5 text-xs font-medium text-[#6f7771] bg-[#123f36] text-white">+{q.topics.length - 3}</span>
                        )}
                      </td>
                      <td className="text-center">
                        {q.source === "leetcode" ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#ffa1161a] text-[.7rem] font-bold text-[#ffa116]">LC</span>
                        ) : (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#123f36]/10 text-[.7rem] font-bold text-[#123f36]">OA</span>
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
