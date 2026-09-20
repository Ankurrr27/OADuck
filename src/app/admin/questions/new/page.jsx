"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppHeader from "../../../components/AppHeader";
import Sidebar from "../../../components/Sidebar";

export default function NewQuestionPage() {
  const router = useRouter();
  
  // Form State
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [description, setDescription] = useState("");
  const [topics, setTopics] = useState("");
  const [examples, setExamples] = useState([]);
  const [constraints, setConstraints] = useState([]);
  const [expectedTC, setExpectedTC] = useState("");
  const [expectedSC, setExpectedSC] = useState("");
  const [source, setSource] = useState("admin");
  const [hints, setHints] = useState("");
  
  const [sourceUrl, setSourceUrl] = useState("");
  const [testCases, setTestCases] = useState([]);
  const [optimalSolutions, setOptimalSolutions] = useState([{ language: "JavaScript", code: "" }]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function handleSave(e) {
    e.preventDefault();
    
    if (!title || !difficulty) {
      setSaveError("Title and difficulty are required.");
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      const payload = {
        title,
        difficulty,
        description,
        topics: topics ? topics.split(",").map(t => t.trim()).filter(Boolean) : [],
        examples,
        constraints,
        expectedTC,
        expectedSC,
        hints: hints.split("\n").map((content) => ({ content })).filter((hint) => hint.content.trim()),
        source,
        sourceUrl,
        testCases,
        optimalSolutions,
      };

      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setSaveError(data.error || "Failed to save question.");
        return;
      }

      router.push("/admin"); // Or redirect to a specific question page if it existed
    } catch (err) {
      setSaveError("An error occurred while saving the question.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f4ef] text-[#17221e]">
      <AppHeader />
      <div className="flex min-h-[calc(100vh-60px)] ">
        <Sidebar />
        <section className="w-full max-w-[900px] flex-1 mx-auto px-[clamp(24px,4vw,56px)] py-19 max-w-[1120px]" style={{ maxWidth: "800px" }}>
          <p className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-[#a07725]">
            <Link href="/admin" style={{ textDecoration: "none", color: "inherit" }}>&larr; Back to Admin</Link>
          </p>
          
          <div style={{ marginBottom: "2rem" }}>
            <h1>Add new question</h1>
            <p className="mt-4 text-sm text-[#6f7771]">Enter the question details manually for your practice library.</p>
          </div>

          <form className="mt-11 grid max-w-[560px] gap-[18px] [&_label]:grid [&_label]:gap-1.5 [&_label]:text-xs [&_label]:font-semibold [&_label]:text-[#505a53] [&_input]:min-h-10 [&_input]:w-full [&_input]:rounded-md [&_input]:border [&_input]:border-[#d7dad3] [&_input]:bg-[#fffefa] [&_input]:px-3 [&_textarea]:w-full [&_textarea]:rounded-md [&_textarea]:border [&_textarea]:border-[#d7dad3] [&_textarea]:bg-[#fffefa] [&_textarea]:p-3" onSubmit={handleSave}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <label>
                Title
                <input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </label>
              
              <label>
                Difficulty
                <select 
                  className="min-h-10 w-full rounded-md border border-[#d7dad3] bg-[#fffefa] px-3 text-[13px] outline-none focus:border-[#7c9b8d] focus:ring-3 focus:ring-[#123f36]/10" 
                  style={{ margin: "6px 0 0" }}
                  value={difficulty} 
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </label>
            </div>

            <label>
              Topics (comma-separated)
              <input value={topics} onChange={(e) => setTopics(e.target.value)} placeholder="Array, Hash Table" />
            </label>

            <label>
              Source
              <select value={source} onChange={(e) => setSource(e.target.value)}>
                <option value="admin">Admin</option>
                <option value="leetcode">LeetCode</option>
                <option value="gfg">GeeksforGeeks</option>
              </select>
            </label>

            <label>
              Source URL {source !== "admin" && "(required)"}
              <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} required={source !== "admin"} placeholder="https://..." />
            </label>

            <label>
              Constraints (one per line)
              <textarea value={Array.isArray(constraints) ? constraints.join("\n") : ""} onChange={(e) => setConstraints(e.target.value.split("\n").filter(Boolean))} rows={4} />
            </label>

            <label>
              Hints (maximum 2, one per line)
              <textarea value={hints} onChange={(e) => setHints(e.target.value.split("\n").slice(0, 2).join("\n"))} rows={4} />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <label>
                Expected time complexity
                <input value={expectedTC} onChange={(e) => setExpectedTC(e.target.value)} placeholder="O(n)" />
              </label>
              <label>
                Expected space complexity
                <input value={expectedSC} onChange={(e) => setExpectedSC(e.target.value)} placeholder="O(1)" />
              </label>
            </div>

            <label>
              Description (HTML or plain text)
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={8} placeholder="Describe the problem..." />
            </label>

            <fieldset style={{ display: "grid", gap: "0.75rem", border: "1px solid var(--line)", padding: "1rem" }}>
              <legend>Optimal solutions</legend>
              {optimalSolutions.map((solution, index) => (
                <div key={index} style={{ display: "grid", gap: "0.5rem" }}>
                  <input value={solution.language} onChange={(event) => setOptimalSolutions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, language: event.target.value } : item))} placeholder="Language" />
                  <textarea value={solution.code} onChange={(event) => setOptimalSolutions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, code: event.target.value } : item))} rows={8} placeholder="Paste the optimal solution code" />
                  <button type="button" onClick={() => setOptimalSolutions((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="inline-flex min-h-9 w-fit items-center justify-center rounded-md border border-[#d7dad3] px-3 py-2 text-xs text-[#b33a32]">Remove solution</button>
                </div>
              ))}
              <button type="button" onClick={() => setOptimalSolutions((current) => [...current, { language: "", code: "" }])} className="inline-flex min-h-9 w-fit items-center justify-center rounded-md border border-[#d7dad3] px-3 py-2 text-xs font-semibold text-[#123f36]">+ Add solution</button>
            </fieldset>

            <fieldset style={{ display: "grid", gap: "0.75rem", border: "1px solid var(--line)", padding: "1rem" }}>
              <legend>Test cases</legend>
              {testCases.map((testCase, index) => (
                <div key={index} style={{ display: "grid", gap: "0.6rem", borderBottom: "1px solid var(--line)", paddingBottom: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <strong>Test case {index + 1}</strong>
                    <button type="button" onClick={() => setTestCases((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove test case ${index + 1}`} title="Remove test case" style={{ display: "grid", placeItems: "center", width: "2rem", height: "2rem", border: "1px solid #d7dad3", borderRadius: "0.375rem", background: "transparent", color: "#b33a32", cursor: "pointer", fontSize: "1.25rem", lineHeight: 1 }}>×</button>
                  </div>
                  <textarea value={testCase.input} onChange={(event) => setTestCases((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, input: event.target.value } : item))} rows={3} placeholder="Input" required />
                  <textarea value={testCase.output} onChange={(event) => setTestCases((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, output: event.target.value } : item))} rows={3} placeholder="Expected output" required />
                  <label style={{ display: "flex", gridTemplateColumns: "none", flexDirection: "row", gap: "0.4rem" }}>Visibility<select value={testCase.isHidden ? "hidden" : "shown"} onChange={(event) => setTestCases((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, isHidden: event.target.value === "hidden" } : item))}><option value="shown">Shown</option><option value="hidden">Hidden</option></select></label>
                </div>
              ))}
              <button type="button" onClick={() => setTestCases((current) => [...current, { input: "", output: "", isHidden: true }])} className="inline-flex min-h-9 w-fit items-center justify-center rounded-md border border-[#d7dad3] bg-[#fffefa] px-3 py-2 text-xs font-semibold text-[#123f36]">+ Add test case</button>
            </fieldset>

            {examples.length > 0 && (
              <div style={{ marginTop: "1.5rem" }}>
                <strong>Examples</strong>
                <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
                  {examples.map((ex, i) => (
                    <li key={i} style={{ marginBottom: "0.5rem", color: "var(--muted)" }}>{ex}</li>
                  ))}
                </ul>
              </div>
            )}

            {constraints.length > 0 && (
              <div style={{ marginTop: "1.5rem" }}>
                <strong>Constraints</strong>
                <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
                  {constraints.map((c, i) => (
                    <li key={i} style={{ marginBottom: "0.5rem", color: "var(--muted)" }}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ marginTop: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <button 
                className="inline-flex min-h-10 items-center justify-center rounded-md border-0 bg-[#123f36] px-4 py-2 text-[13px] font-semibold text-[#f7f5ed] no-underline disabled:cursor-wait disabled:opacity-65" 
                type="submit" 
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Problem"}
              </button>
              
              {saveError && (
                <p className="text-sm text-[#6f7771]" style={{ margin: 0, color: "#d32f2f" }}>{saveError}</p>
              )}
            </div>
          </form>

        </section>
      </div>
    </main>
  );
}
