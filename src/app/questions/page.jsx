"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "../components/Sidebar";
import AppHeader from "../components/AppHeader";
import PageLoader from "../components/PageLoader";

const difficultyColor = { Easy: "#22c55e", Medium: "#f59e0b", Hard: "#ef4444" };

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch("/api/questions");
        const data = await res.json();
        if (data.success) setQuestions(data.questions);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  const filtered = filter === "All" ? questions : questions.filter((question) => question.difficulty === filter);

  return (
    <main className="min-h-screen bg-[#f5f4ef] text-[#17221e]">
      <AppHeader />
      <div className="flex min-h-[calc(100vh-60px)]">
        <Sidebar />
        <section className="w-full max-w-[1280px] flex-1 mx-auto px-[clamp(24px,4vw,56px)] py-12 md:py-16">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-[#a07725]">Question library</p>
          <div className="flex flex-col gap-5 rounded-2xl border border-[#dfe1da] bg-[#fffefa] p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-8">
            <div>
              <h1 className="text-3xl font-semibold tracking-[-.04em] sm:text-4xl">Find your next challenge.</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#6f7771]">Explore questions by difficulty, follow your curiosity, and turn a quiet hour into useful practice.</p>
            </div>
            <div className="flex min-w-32 items-center gap-3 rounded-xl bg-[#e8f1eb] px-4 py-3 sm:justify-center">
              <span className="text-2xl font-semibold tracking-[-.05em] text-[#123f36]">{questions.length}</span>
              <span className="text-xs font-semibold leading-4 text-[#526057]">questions<br />available</span>
            </div>
          </div>

          <div className="mt-7 rounded-2xl border border-[#dfe1da] bg-[#fffefa] p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-sm font-semibold text-[#36433b]">Choose a difficulty</p><p className="mt-1 text-xs text-[#7b867e]">Showing {filtered.length} {filtered.length === 1 ? "question" : "questions"}</p></div>
              <div className="flex flex-wrap gap-2">
                {["All", "Easy", "Medium", "Hard"].map((value) => (
                  <button key={value} className={`inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-xs font-semibold transition ${filter === value ? "border-[#123f36] bg-[#123f36] text-[#fffefa] shadow-sm" : "border-[#dfe1da] bg-[#fffefa] text-[#66736b] hover:border-[#92af9e] hover:bg-[#f4f7f3]"}`} onClick={() => setFilter(value)} type="button">
                    {value !== "All" && <span className="h-2 w-2 rounded-full" style={{ background: difficultyColor[value] }} />}{value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-[#dfe1da] bg-[#fffefa] shadow-sm">
            {loading ? (
              <PageLoader />
            ) : filtered.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#e8f1eb] text-2xl">⌕</span><h2 className="mt-4 text-lg font-semibold">Nothing here yet</h2><p className="mt-2 max-w-sm text-sm leading-6 text-[#6f7771]">Try another difficulty or import a problem to begin building your library.</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-sm">
                  <thead className="bg-[#f7f9f6]"><tr className="[&_th]:border-b [&_th]:border-[#e4e8e3] [&_th]:px-5 [&_th]:py-4 [&_th]:text-left [&_th]:text-[10px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-[.12em] [&_th]:text-[#7b867e]"><th className="w-16">#</th><th>Question</th><th>Difficulty</th><th>Topics</th><th className="text-center!">Source</th></tr></thead>
                  <tbody>
                    {filtered.map((question) => <tr key={question.id} className="group transition-colors hover:bg-[#f7faf7] [&_td]:border-b [&_td]:border-[#edf0ec] [&_td]:px-5 [&_td]:py-4 last:[&_td]:border-b-0">
                      <td className="font-mono text-xs font-semibold text-[#98a19b]">{String(question.questionNumber).padStart(2, "0")}</td>
                      <td><Link className="font-semibold text-[#17221e] no-underline transition group-hover:text-[#176a5a]" href={`/questions/${question.id}`}>{question.title || "Untitled"}<span className="ml-2 opacity-0 transition group-hover:opacity-100" aria-hidden="true">→</span></Link></td>
                      <td><span className="inline-flex rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: `${difficultyColor[question.difficulty]}18`, color: difficultyColor[question.difficulty] }}>{question.difficulty}</span></td>
                      <td><div className="flex flex-wrap gap-1.5">{question.topics?.length ? question.topics.slice(0, 3).map((topic) => <span className="whitespace-nowrap rounded-full bg-[#f0f3ef] px-2.5 py-1 text-[11px] font-medium text-[#607066]" key={topic}>{topic}</span>) : <span className="text-[#a1aaa4]">—</span>}{question.topics?.length > 3 && <span className="rounded-full bg-[#e8f1eb] px-2.5 py-1 text-[11px] font-bold text-[#176a5a]">+{question.topics.length - 3}</span>}</div></td>
                      <td className="text-center"><span className={`inline-grid h-8 min-w-8 place-items-center rounded-lg px-1.5 text-[10px] font-bold ${question.source === "leetcode" ? "bg-[#fff1df] text-[#dd8a13]" : "bg-[#e8f1eb] text-[#176a5a]"}`}>{question.source === "leetcode" ? "LC" : "OA"}</span></td>
                    </tr>)}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
