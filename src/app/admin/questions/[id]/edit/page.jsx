"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppHeader from "../../../../components/AppHeader";
import Sidebar from "../../../../components/Sidebar";
import PageLoader from "../../../../components/PageLoader";

export default function EditQuestionPage() {
  const router = useRouter();
  const { id } = useParams();

  // Loading
  const [pageLoading, setPageLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [description, setDescription] = useState("");
  const [topics, setTopics] = useState("");
  const [examples, setExamples] = useState([]);
  const [constraints, setConstraints] = useState([]);
  const [expectedTC, setExpectedTC] = useState("");
  const [expectedSC, setExpectedSC] = useState("");
  const [hints, setHints] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [optimalSolutions, setOptimalSolutions] = useState([]);
  const [questionNumber, setQuestionNumber] = useState(0);

  // Meta state
  const [sourceUrl, setSourceUrl] = useState("");
  const [source, setSource] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchQuestion() {
      try {
        const res = await fetch(`/api/questions/${id}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          setLoadError(data.error || "Question not found.");
          return;
        }

        const q = data.question;
        setTitle(q.title || "");
        setDifficulty(q.difficulty || "Easy");
        setDescription(q.description || "");
        setTopics(q.topics ? q.topics.join(", ") : "");
        setExamples(q.examples || []);
        setConstraints(q.constraints || []);
        setExpectedTC(q.expectedTC || "");
        setExpectedSC(q.expectedSC || "");
        setHints(q.hints || []);
        setTestCases(q.testCases || []);
        setOptimalSolutions(q.optimalSolutions || []);
        setQuestionNumber(q.questionNumber);
        setSourceUrl(q.sourceUrl || "");
        setSource(q.source || "");
      } catch (err) {
        setLoadError("Failed to load question.");
      } finally {
        setPageLoading(false);
      }
    }
    if (id) fetchQuestion();
  }, [id]);

  async function handleSave(e) {
    e.preventDefault();

    if (!title || !difficulty) {
      setSaveError("Title and difficulty are required.");
      return;
    }

    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);

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
        hints,
        testCases,
        optimalSolutions,
        source: source || "admin",
        sourceUrl,
      };

      const response = await fetch(`/api/questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setSaveError(data.error || "Failed to update question.");
        return;
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError("An error occurred while saving the question.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/questions/${id}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        setSaveError(data.error || "Failed to delete question.");
        setIsDeleting(false);
        return;
      }

      router.push("/questions");
    } catch (err) {
      setSaveError("An error occurred while deleting.");
      setIsDeleting(false);
    }
  }

  if (pageLoading) {
    return <PageLoader />;
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-[#f5f4ef] text-[#17221e]">
        <AppHeader />
        <div className="flex min-h-[calc(100vh-60px)] ">
          <Sidebar />
          <section className="w-full max-w-[900px] flex-1 mx-auto px-[clamp(24px,4vw,56px)] py-19 max-w-[1120px]" style={{ maxWidth: "800px" }}>
            <p className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-[#a07725]">
              <Link href="/questions" style={{ textDecoration: "none", color: "inherit" }}>&larr; Back to Library</Link>
            </p>
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <p>{loadError}</p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f4ef] text-[#17221e]">
      <AppHeader />
      <div className="flex min-h-[calc(100vh-60px)] ">
        <Sidebar />
        <section className="w-full max-w-[900px] flex-1 mx-auto px-[clamp(24px,4vw,56px)] py-19 max-w-[1120px]" style={{ maxWidth: "800px" }}>
          <p className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-[#a07725]">
            <Link href="/questions" style={{ textDecoration: "none", color: "inherit" }}>&larr; Back to Library</Link>
          </p>

          <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1>Edit question #{questionNumber}</h1>
              <p className="mt-4 text-sm text-[#6f7771]">Update the manually maintained question details.</p>
            </div>
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
              <select value={source || "admin"} onChange={(e) => setSource(e.target.value)}>
                <option value="admin">Admin</option>
                <option value="leetcode">LeetCode</option>
                <option value="gfg">GeeksforGeeks</option>
              </select>
            </label>

            <label>
              Source URL
              <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} required={source !== "admin"} placeholder="https://..." />
            </label>

            <label>
              Constraints (one per line)
              <textarea value={Array.isArray(constraints) ? constraints.join("\n") : ""} onChange={(e) => setConstraints(e.target.value.split("\n").filter(Boolean))} rows={4} />
            </label>

            <label>
              Hints (maximum 2, one per line)
              <textarea value={hints.map((hint) => hint.content || "").join("\n")} onChange={(e) => setHints(e.target.value.split("\n").slice(0, 2).map((content) => ({ content })))} rows={4} />
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

            {testCases.length > 0 && (
              <fieldset style={{ display: "grid", gap: "0.75rem", border: "1px solid var(--line)", padding: "1rem" }}>
                <legend>Test cases</legend>
                {testCases.map((testCase, index) => (
                  <div key={testCase.id || index} style={{ display: "grid", gap: "0.6rem", borderBottom: "1px solid var(--line)", paddingBottom: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <strong>Test case {index + 1}</strong>
                      <button type="button" onClick={() => setTestCases((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove test case ${index + 1}`} title="Remove test case" style={{ display: "grid", placeItems: "center", width: "2rem", height: "2rem", border: "1px solid #d7dad3", borderRadius: "0.375rem", background: "transparent", color: "#b33a32", cursor: "pointer", fontSize: "1.25rem", lineHeight: 1 }}>×</button>
                    </div>
                    <textarea value={testCase.input || ""} onChange={(event) => setTestCases((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, input: event.target.value } : item))} rows={3} placeholder="Input" required />
                    <textarea value={testCase.output || ""} onChange={(event) => setTestCases((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, output: event.target.value } : item))} rows={3} placeholder="Expected output" required />
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                      <label style={{ display: "flex", gridTemplateColumns: "none", flexDirection: "row", gap: "0.5rem" }}>Visibility<select value={testCase.isHidden ? "hidden" : "shown"} onChange={(event) => setTestCases((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, isHidden: event.target.value === "hidden" } : item))}><option value="shown">Shown</option><option value="hidden">Hidden</option></select></label>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => setTestCases((current) => [...current, { input: "", output: "", isHidden: true }])} className="inline-flex min-h-9 w-fit items-center justify-center rounded-md border border-[#d7dad3] bg-[#fffefa] px-3 py-2 text-xs font-semibold text-[#123f36]">+ Add test case</button>
              </fieldset>
            )}

            {testCases.length === 0 && (
              <button type="button" onClick={() => setTestCases([{ input: "", output: "", isHidden: true }])} className="inline-flex min-h-9 w-fit items-center justify-center rounded-md border border-[#d7dad3] bg-[#fffefa] px-3 py-2 text-xs font-semibold text-[#123f36]">+ Add test case</button>
            )}

            <label>
              Description (HTML or plain text)
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={8} placeholder="Describe the problem..." />
            </label>

            <fieldset style={{ display: "grid", gap: "0.75rem", border: "1px solid var(--line)", padding: "1rem" }}>
              <legend>Optimal solutions</legend>
              {optimalSolutions.map((solution, index) => (
                <div key={solution.id || index} style={{ display: "grid", gap: "0.5rem" }}>
                  <input value={solution.language || ""} onChange={(event) => setOptimalSolutions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, language: event.target.value } : item))} placeholder="Language" />
                  <textarea value={solution.code || ""} onChange={(event) => setOptimalSolutions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, code: event.target.value } : item))} rows={8} placeholder="Paste the optimal solution code" />
                  <button type="button" onClick={() => setOptimalSolutions((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="inline-flex min-h-9 w-fit items-center justify-center rounded-md border border-[#d7dad3] px-3 py-2 text-xs text-[#b33a32]">Remove solution</button>
                </div>
              ))}
              <button type="button" onClick={() => setOptimalSolutions((current) => [...current, { language: "", code: "" }])} className="inline-flex min-h-9 w-fit items-center justify-center rounded-md border border-[#d7dad3] px-3 py-2 text-xs font-semibold text-[#123f36]">+ Add solution</button>
            </fieldset>

            {Array.isArray(examples) && examples.length > 0 && (
              <div style={{ marginTop: "1.5rem" }}>
                <strong>Examples</strong>
                <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
                  {examples.map((ex, i) => (
                    <li key={i} style={{ marginBottom: "0.5rem", color: "var(--muted)" }}>{typeof ex === 'string' ? ex : JSON.stringify(ex)}</li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(constraints) && constraints.length > 0 && (
              <div style={{ marginTop: "1.5rem" }}>
                <strong>Constraints</strong>
                <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
                  {constraints.map((c, i) => (
                    <li key={i} style={{ marginBottom: "0.5rem", color: "var(--muted)" }}>{typeof c === 'string' ? c : JSON.stringify(c)}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ marginTop: "2rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-md border-0 bg-[#123f36] px-4 py-2 text-[13px] font-semibold text-[#f7f5ed] no-underline disabled:cursor-wait disabled:opacity-65"
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>

              {saveSuccess && (
                <p className="text-sm text-[#6f7771]" style={{ margin: 0, color: "var(--green)" }}>Changes saved!</p>
              )}

              {saveError && (
                <p className="text-sm text-[#6f7771]" style={{ margin: 0, color: "#d32f2f" }}>{saveError}</p>
              )}
            </div>
          </form>

          {/* Delete section */}
          <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--line)" }}>
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  background: "transparent",
                  border: "1px solid #d32f2f",
                  color: "#d32f2f",
                  padding: "0.5rem 1.2rem",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Delete Question
              </button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ color: "#d32f2f", fontWeight: 600, fontSize: "0.9rem" }}>Are you sure?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  style={{
                    background: "#d32f2f",
                    border: "none",
                    color: "#fff",
                    padding: "0.5rem 1.2rem",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {isDeleting ? "Deleting..." : "Yes, delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--line)",
                    color: "var(--muted)",
                    padding: "0.5rem 1.2rem",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

        </section>
      </div>
    </main>
  );
}
