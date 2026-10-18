"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const COLORS = ["#064d3b", "#118b68", "#27bd8d", "#0ba7bd", "#f39a08", "#ee5a0a", "#64758b", "#84cdb4"];
const formatNumber = (value) => new Intl.NumberFormat("en-IN").format(value || 0);
const isAccepted = (status) => ["accepted", "success", "passed", "solved"].includes(String(status || "").toLowerCase());
const getTopics = (question) => question.topics?.length ? question.topics : ["Uncategorized"];
const difficultyColor = { easy: "#1fbd8c", medium: "#f1a208", hard: "#ed405c" };

function Doughnut({ items, total, colors = COLORS }) {
  let cursor = 0;
  const stops = items.length ? items.map((item, index) => { const start = cursor; cursor += (item.value / total) * 100; return `${colors[index % colors.length]} ${start}% ${cursor}%`; }).join(", ") : "#e9efec 0 100%";
  return <div className="admin-doughnut" style={{ "--chart-stops": stops }}><div className="admin-doughnut__inner"><strong>{formatNumber(total)}</strong><span>PROBLEMS</span></div></div>;
}

function StatCard({ label, value, detail }) {
  return <article className="admin-stat-card"><div className="admin-stat-card__top"><span>{label}</span></div><strong>{formatNumber(value)}</strong><small>{detail}</small></article>;
}

export default function AdminDashboard({ currentUser, users, questions, submissions, sessionCount }) {
  const [range, setRange] = useState("all");
  const [topicFilter, setTopicFilter] = useState("All Topics");
  const [search, setSearch] = useState("");
  const topics = useMemo(() => [...new Set(questions.flatMap(getTopics))].sort(), [questions]);
  const questionStats = useMemo(() => questions.map((question) => { const rows = submissions.filter((submission) => submission.questionId === question.id); const accepted = rows.filter((submission) => isAccepted(submission.status)); const solvedUsers = new Set(accepted.map((submission) => submission.userId).filter(Boolean)); const questionTopics = getTopics(question); return { ...question, topics: questionTopics, topic: questionTopics.join(", "), attempts: rows.length, acceptanceRate: rows.length ? (accepted.length / rows.length) * 100 : 0, totalSolves: solvedUsers.size || accepted.length }; }), [questions, submissions]);
  const activeSubmissions = useMemo(() => { if (range === "all") return submissions; const asOf = submissions[0] ? new Date(submissions[0].createdAt).getTime() : 0; const since = asOf - Number(range) * 24 * 60 * 60 * 1000; return submissions.filter((submission) => new Date(submission.createdAt).getTime() >= since); }, [range, submissions]);
  const filteredQuestions = useMemo(() => { const query = search.trim().toLowerCase(); return questionStats.filter((question) => (topicFilter === "All Topics" || question.topics.includes(topicFilter)) && (!query || `${question.title || ""} ${question.questionNumber} ${question.topic}`.toLowerCase().includes(query))); }, [questionStats, search, topicFilter]);
  const topicItems = useMemo(() => { const counts = new Map(); questions.flatMap(getTopics).forEach((topic) => counts.set(topic, (counts.get(topic) || 0) + 1)); return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value })); }, [questions]);
  const topicTotal = topicItems.reduce((sum, item) => sum + item.value, 0);
  const difficultyItems = useMemo(() => { const counts = new Map(); questions.forEach((question) => { const difficulty = question.difficulty || "Unknown"; counts.set(difficulty, (counts.get(difficulty) || 0) + 1); }); return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value })); }, [questions]);
  const avgAttempts = questionStats.length ? activeSubmissions.length / questionStats.length : 0;
  const acceptedCount = activeSubmissions.filter((submission) => isAccepted(submission.status)).length;
  const acceptanceRate = activeSubmissions.length ? (acceptedCount / activeSubmissions.length) * 100 : 0;

  return <section className="admin-dashboard">
    <h1 className="admin-dashboard-title">Admin Dashboard Overview</h1><div className="admin-dashboard__controls"><div className="admin-range" role="group" aria-label="Dashboard time range">{[{ id: "7", label: "Last 7 Days" }, { id: "30", label: "Last 30 Days" }, { id: "all", label: "All Time" }].map((item) => <button key={item.id} className={range === item.id ? "is-active" : ""} onClick={() => setRange(item.id)}>{item.label}</button>)}</div></div>
    <div className="admin-stat-grid"><StatCard label="Registered Accounts" value={users.length} detail="users in workspace" /><StatCard label="Problem Bank" value={questions.length} detail="questions available" /><StatCard label="Practice Sessions" value={sessionCount} detail="sessions recorded" /><StatCard label="Submission Attempts" value={activeSubmissions.length} detail={`${range === "all" ? "all time" : `last ${range} days`}`} /></div>
    <div className="admin-chart-grid">
      <article className="admin-panel"><div className="admin-panel__heading"><h2>Questions by Topic</h2><span>{formatNumber(questions.length)} questions · {formatNumber(topicTotal)} topic tags</span></div><div className="admin-chart-content"><Doughnut items={topicItems} total={topicTotal} /><div className="admin-legend">{topicItems.map((item, index) => <div key={item.label}><i style={{ background: COLORS[index % COLORS.length] }} /><span title={item.label}>{item.label}</span><strong>{formatNumber(item.value)}</strong><small>{topicTotal ? `${((item.value / topicTotal) * 100).toFixed(1)}%` : "0.0%"}</small></div>)}</div></div></article>
      <article className="admin-panel"><div className="admin-panel__heading"><h2>Questions by Difficulty</h2><span>{difficultyItems.length} levels</span></div><div className="admin-difficulty-chart"><Doughnut items={difficultyItems} total={questions.length} colors={difficultyItems.map((item) => difficultyColor[String(item.label).toLowerCase()] || "#64758b")} /><div className="admin-difficulty-list">{difficultyItems.map((item) => { const color = difficultyColor[String(item.label).toLowerCase()] || "#64758b"; return <div className="admin-difficulty-item" key={item.label}><div><i style={{ background: color }} /><strong>{item.label}</strong><b>{formatNumber(item.value)}</b></div><div className="admin-progress"><span style={{ width: `${questions.length ? (item.value / questions.length) * 100 : 0}%`, background: color }} /></div><small>{questions.length ? `${((item.value / questions.length) * 100).toFixed(1)}% of problem bank` : "0.0% of problem bank"}</small></div>; })}</div></div></article>
    </div>
    <article className="admin-panel admin-telemetry"><div className="admin-panel__heading admin-panel__heading--table"><div><h2>Recent Submissions &amp; Problem Telemetry</h2><p>{formatNumber(activeSubmissions.length)} attempts · {avgAttempts.toFixed(1)} average attempts per tracked problem · {acceptanceRate.toFixed(1)}% acceptance</p></div><div className="admin-table-controls"><select value={topicFilter} onChange={(event) => setTopicFilter(event.target.value)} aria-label="Filter by topic"><option>All Topics</option>{topics.map((topic) => <option key={topic}>{topic}</option>)}</select><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter questions..." aria-label="Filter questions" /></div></div><div className="admin-table-wrap"><table><thead><tr><th>ID</th><th>Question Name</th><th>Topic</th><th>Difficulty</th><th>Avg Attempts</th><th>Acceptance Rate</th><th>Total Solves</th></tr></thead><tbody>{filteredQuestions.map((question) => <tr key={question.id}><td><code>Q{String(question.questionNumber).padStart(3, "0")}</code></td><td><Link href={`/admin/questions/${question.id}/edit`}>{question.title || "Untitled question"} <span aria-hidden="true">↗</span></Link></td><td><span className="admin-pill admin-pill--topic">{question.topic}</span></td><td><span className={`admin-pill admin-pill--${String(question.difficulty || "unknown").toLowerCase()}`}>{question.difficulty || "Unknown"}</span></td><td>{question.attempts.toFixed(1)}</td><td><div className="admin-rate"><span>{question.acceptanceRate.toFixed(1)}%</span><i><b style={{ width: `${question.acceptanceRate}%` }} /></i></div></td><td>{formatNumber(question.totalSolves)}</td></tr>)}</tbody></table>{!filteredQuestions.length && <p className="admin-empty">No questions match the current filters.</p>}</div><div className="admin-table-footer"><span>Showing {filteredQuestions.length} of {questions.length} questions</span><Link href="/admin/questions">Manage all questions&nbsp; →</Link></div></article>
    <div className="admin-dashboard__footer"><span>Signed in as {currentUser.email}</span></div>
  </section>;
}
