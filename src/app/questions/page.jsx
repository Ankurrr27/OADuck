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
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [topicFilter, setTopicFilter] = useState("All topics");
  const [statusFilter, setStatusFilter] = useState("All status");
  const [sortOrder, setSortOrder] = useState("Question number");

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

  const topics = [...new Set(questions.flatMap((question) => question.topics || []))].sort((a, b) => a.localeCompare(b));
  const filtered = questions
    .filter((question) => {
      const query = searchTerm.trim().toLowerCase();
      return !query
        || String(question.questionNumber).includes(query)
        || question.title?.toLowerCase().includes(query)
        || question.topics?.some((topic) => topic.toLowerCase().includes(query));
    })
    .filter((question) => filter === "All" || question.difficulty === filter)
    .filter((question) => topicFilter === "All topics" || question.topics?.includes(topicFilter))
    .filter((question) => {
      if (statusFilter === "Attempted") return question.progress?.attempts > 0;
      if (statusFilter === "Not attempted") return !question.progress?.attempts;
      if (statusFilter === "Solved") return question.progress?.solved;
      return true;
    })
    .sort((a, b) => sortOrder === "Most frequent"
      ? (b.progress?.attempts || 0) - (a.progress?.attempts || 0) || a.questionNumber - b.questionNumber
      : a.questionNumber - b.questionNumber);

  const selectClass = "h-9 min-w-28 rounded-md border border-[#dfe1da] bg-[#fffefa] px-2.5 text-xs font-medium text-[#526057] outline-none transition hover:border-[#92af9e] focus:border-[#176a5a]";

  return (
    <main className="min-h-screen bg-[#f5f4ef] text-[#17221e]">
      <AppHeader />
      <div className="flex min-h-[calc(100vh-60px)]">
        <Sidebar />
        <section className="w-full max-w-[1440px] flex-1 mx-auto px-[clamp(20px,3vw,40px)] py-6 md:py-8">
          <div className="flex items-center justify-between gap-4 border-b border-[#dfe1da] pb-4">
            <h1 className="text-2xl font-semibold tracking-[-.04em] text-[#123f36] sm:text-[28px]">Question library</h1>
            <p className="text-base text-[#66736b] sm:text-lg"><span className="text-xl font-semibold text-[#123f36] sm:text-2xl">{questions.length}</span> questions</p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-[#dfe1da] py-2.5">
            <div className="flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:flex-nowrap">
              <label className="relative w-full sm:w-56 sm:shrink-0">
                <span className="sr-only">Search questions</span>
                <svg className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 fill-none stroke-[#738078] [stroke-linecap:round] [stroke-width:1.7]" aria-hidden="true" viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.2 4.2" /></svg>
                <input className="h-9 w-full rounded-md border border-[#dfe1da] bg-[#fffefa] pl-8 pr-3 text-xs text-[#36433b] outline-none transition placeholder:text-[#89938c] hover:border-[#92af9e] focus:border-[#176a5a]" type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search questions" />
              </label>
              <select aria-label="Filter by difficulty" className={selectClass} value={filter} onChange={(event) => setFilter(event.target.value)}>
                {["All", "Easy", "Medium", "Hard"].map((value) => <option key={value} value={value}>{value === "All" ? "All difficulties" : value}</option>)}
              </select>
              <select aria-label="Filter by topic" className={selectClass} value={topicFilter} onChange={(event) => setTopicFilter(event.target.value)}>
                <option>All topics</option>{topics.map((topic) => <option key={topic}>{topic}</option>)}
              </select>
              <select aria-label="Filter by progress" className={selectClass} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                {["All status", "Attempted", "Not attempted", "Solved"].map((status) => <option key={status}>{status}</option>)}
              </select>
              <select aria-label="Sort questions" className={selectClass} value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
                {["Most frequent", "Question number"].map((sort) => <option key={sort}>{sort}</option>)}
              </select>
              {(searchTerm || topicFilter !== "All topics" || statusFilter !== "All status" || filter !== "All") && <button className="px-1.5 text-xs font-semibold text-[#176a5a] hover:underline" onClick={() => { setSearchTerm(""); setFilter("All"); setTopicFilter("All topics"); setStatusFilter("All status"); }} type="button">Clear</button>}
            </div>
          </div>

          <div className={loading ? "mt-3" : "mt-3 overflow-hidden rounded-lg border border-[#dfe1da] bg-[#fffefa]"}>
            {loading ? (
              <PageLoader label="Loading questions…" />
            ) : filtered.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#e8f1eb] text-2xl">⌕</span><h2 className="mt-4 text-lg font-semibold">Nothing here yet</h2><p className="mt-2 max-w-sm text-sm leading-6 text-[#6f7771]">Try another difficulty or import a problem to begin building your library.</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-sm">
                  <thead className="bg-[#f7f9f6]"><tr className="[&_th]:border-b [&_th]:border-[#e4e8e3] [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-left [&_th]:text-[10px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-[.12em] [&_th]:text-[#7b867e]"><th className="w-14">#</th><th>Question</th><th>Difficulty</th><th>Topics</th><th>Solve</th></tr></thead>
                  <tbody>
                    {filtered.map((question) => <tr key={question.id} className="group transition-colors hover:bg-[#f7faf7] [&_td]:border-b [&_td]:border-[#edf0ec] [&_td]:px-4 [&_td]:py-2.5 last:[&_td]:border-b-0">
                      <td className="font-mono text-xs font-semibold text-[#98a19b]">{String(question.questionNumber).padStart(2, "0")}</td>
                      <td><Link className="font-semibold text-[#17221e] no-underline transition group-hover:text-[#176a5a]" href={`/questions/${question.id}`}>{question.title || "Untitled"}<span className="ml-2 opacity-0 transition group-hover:opacity-100" aria-hidden="true">→</span></Link></td>
                      <td><span className="inline-flex rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: `${difficultyColor[question.difficulty]}18`, color: difficultyColor[question.difficulty] }}>{question.difficulty}</span></td>
                      <td><div className="flex flex-wrap gap-1.5">{question.topics?.length ? question.topics.slice(0, 3).map((topic) => <span className="whitespace-nowrap rounded-full bg-[#f0f3ef] px-2.5 py-1 text-[11px] font-medium text-[#607066]" key={topic}>{topic}</span>) : <span className="text-[#a1aaa4]">—</span>}{question.topics?.length > 3 && <span className="rounded-full bg-[#e8f1eb] px-2.5 py-1 text-[11px] font-bold text-[#176a5a]">+{question.topics.length - 3}</span>}</div></td>
                      <td><Link className="inline-flex items-center gap-1 rounded-md bg-[#123f36] px-3 py-1.5 text-xs font-semibold text-white no-underline transition hover:bg-[#176a5a]" href={`/questions/${question.id}`}>Solve <span aria-hidden="true">→</span></Link></td>
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
