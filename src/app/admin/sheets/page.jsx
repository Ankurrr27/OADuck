"use client";

import { useEffect, useState } from "react";
import AppHeader from "../../components/AppHeader";
import Sidebar from "../../components/Sidebar";

export default function AdminSheetsPage() {
  const [sheets, setSheets] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [name, setName] = useState("");
  const [selectedSheet, setSelectedSheet] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const [sheetResponse, questionResponse] = await Promise.all([fetch("/api/admin/sheets"), fetch("/api/questions")]);
    const sheetData = await sheetResponse.json();
    const questionData = await questionResponse.json();
    if (sheetData.success) {
      setSheets(sheetData.sheets);
      setSelectedSheet((current) => current || sheetData.sheets[0]?.id || "");
    }
    if (questionData.success) setQuestions(questionData.questions);
  }

  useEffect(() => {
    const loadSheets = window.setTimeout(() => { load(); }, 0);
    return () => window.clearTimeout(loadSheets);
  }, []);

  async function createSheet(event) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/admin/sheets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const data = await response.json();
    if (!response.ok) return setError(data.error || "Failed to create sheet");
    setName("");
    await load();
    setSelectedSheet(data.sheet.id);
  }

  async function assignQuestion(event) {
    event.preventDefault();
    if (!selectedSheet || !selectedQuestion) return;
    const response = await fetch(`/api/admin/sheets/${selectedSheet}/questions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId: selectedQuestion }) });
    const data = await response.json();
    if (!response.ok) return setError(data.error || "Failed to add question");
    setSelectedQuestion("");
    await load();
  }

  async function removeQuestion(questionId) {
    await fetch(`/api/admin/sheets/${selectedSheet}/questions`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId }) });
    await load();
  }

  const activeSheet = sheets.find((sheet) => sheet.id === selectedSheet);
  const assignedIds = new Set(activeSheet?.sheetQuestions.map(({ question }) => question.id) || []);
  const availableQuestions = questions.filter((question) => !assignedIds.has(question.id));

  return <main className="min-h-screen bg-[#f5f4ef] text-[#17221e]"><AppHeader /><div className="flex min-h-[calc(100vh-60px)]"><Sidebar /><section className="w-full max-w-[900px] flex-1 mx-auto px-[clamp(24px,4vw,56px)] py-16">
    <p className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-[#a07725]">Administration</p>
    <h1>Manage sheets</h1>
    <p className="mt-3 text-sm text-[#6f7771]">Create sheets first, then select questions to add. Adding a question never changes a sheet.</p>
    <form onSubmit={createSheet} className="mt-8 flex gap-3"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="New sheet name" required className="min-h-10 flex-1 rounded-md border border-[#d7dad3] bg-[#fffefa] px-3 text-sm" /><button className="rounded-md bg-[#123f36] px-4 py-2 text-sm font-semibold text-white">Create sheet</button></form>
    {sheets.length > 0 && <><label className="mt-8 grid gap-2 text-xs font-semibold text-[#505a53]">Sheet<select value={selectedSheet} onChange={(event) => setSelectedSheet(event.target.value)} className="min-h-10 rounded-md border border-[#d7dad3] bg-[#fffefa] px-3 text-sm">{sheets.map((sheet) => <option key={sheet.id} value={sheet.id}>{sheet.name}</option>)}</select></label>
      <form onSubmit={assignQuestion} className="mt-5 flex gap-3"><select value={selectedQuestion} onChange={(event) => setSelectedQuestion(event.target.value)} className="min-h-10 flex-1 rounded-md border border-[#d7dad3] bg-[#fffefa] px-3 text-sm"><option value="">Choose a question</option>{availableQuestions.map((question) => <option key={question.id} value={question.id}>#{question.questionNumber} {question.title}</option>)}</select><button disabled={!selectedQuestion} className="rounded-md bg-[#123f36] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Add question</button></form>
      <div className="mt-8 grid gap-2">{activeSheet?.sheetQuestions.map(({ question }) => <div key={question.id} className="flex items-center justify-between border-b border-[#dfe1da] py-3 text-sm"><span>#{question.questionNumber} {question.title}</span><button type="button" onClick={() => removeQuestion(question.id)} className="text-xs font-semibold text-[#b33a32]">Remove</button></div>)}</div></>}
    {error && <p className="mt-4 text-sm text-[#b33a32]">{error}</p>}
  </section></div></main>;
}
