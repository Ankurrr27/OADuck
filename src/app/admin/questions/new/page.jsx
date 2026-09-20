"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppHeader from "../../../components/AppHeader";
import Sidebar from "../../../components/Sidebar";

export default function NewQuestionPage() {
  const router = useRouter();
  
  // Import State
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [description, setDescription] = useState("");
  const [topics, setTopics] = useState("");
  const [examples, setExamples] = useState([]);
  const [constraints, setConstraints] = useState([]);
  
  // Meta state
  const [leetcodeSlug, setLeetcodeSlug] = useState("");
  const [leetcodeId, setLeetcodeId] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function handleImport(e) {
    e.preventDefault();
    if (!importUrl) {
      setImportError("Please enter a valid LeetCode problem URL.");
      return;
    }

    setIsImporting(true);
    setImportError("");
    setImportSuccess(false);

    try {
      const response = await fetch(`/api/leetcode/problem?url=${encodeURIComponent(importUrl)}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        setImportError(data.error || "Failed to import problem.");
        return;
      }

      const problem = data.problem;
      
      setTitle(problem.title || "");
      setDifficulty(problem.difficulty || "Easy");
      setDescription(problem.description || "");
      setTopics(problem.topics ? problem.topics.join(", ") : "");
      setExamples(problem.examples || []);
      setConstraints(problem.constraints || []);
      setLeetcodeSlug(problem.slug || "");
      setLeetcodeId(problem.questionId || "");
      setSourceUrl(problem.url || importUrl);

      setImportSuccess(true);
    } catch (err) {
      setImportError("An error occurred while communicating with the server.");
    } finally {
      setIsImporting(false);
    }
  }

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
        source: "leetcode",
        sourceUrl,
        leetcodeSlug,
        leetcodeId,
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
            <p className="mt-4 text-sm text-[#6f7771]">Import a problem from LeetCode or manually create one.</p>
          </div>

          <div className="grid min-h-36 content-between rounded-lg border border-[#dfe1da] bg-[#fffefa] p-4.5 [&_span]:text-[11px] [&_span]:text-[#6f7771] [&_small]:text-[11px] [&_small]:text-[#6f7771] [&_strong]:text-[38px] [&_strong]:font-medium [&_strong]:tracking-[-.06em] [&_strong]:text-[#123f36]" style={{ padding: "1.5rem", marginBottom: "3rem", display: "block" }}>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Import from LeetCode</h2>
            <form onSubmit={handleImport} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <input 
                  className="min-h-10 w-full rounded-md border border-[#d7dad3] bg-[#fffefa] px-3 text-[13px] outline-none focus:border-[#7c9b8d] focus:ring-3 focus:ring-[#123f36]/10"
                  style={{ margin: 0 }}
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://leetcode.com/problems/two-sum/"
                />
              </div>
              <button 
                className="inline-flex min-h-10 items-center justify-center rounded-md border-0 bg-[#123f36] px-4 py-2 text-[13px] font-semibold text-[#f7f5ed] no-underline disabled:cursor-wait disabled:opacity-65" 
                type="submit" 
                disabled={isImporting}
                style={{ marginTop: 0 }}
              >
                {isImporting ? "Fetching problem..." : "Import Problem"}
              </button>
            </form>
            
            {importError && (
              <p className="text-sm text-[#6f7771]" style={{ marginTop: "1rem", color: "#d32f2f" }}>{importError}</p>
            )}
            
            {importSuccess && (
              <p className="text-sm text-[#6f7771]" style={{ marginTop: "1rem", color: "var(--green)" }}>Problem imported successfully. Review and save below.</p>
            )}
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
              Description Preview (HTML)
              <div 
                style={{ 
                  padding: "1rem", 
                  border: "1px solid var(--line)", 
                  borderRadius: "8px", 
                  maxHeight: "300px", 
                  overflowY: "auto",
                  marginTop: "6px",
                  background: "#fff"
                }}
                dangerouslySetInnerHTML={{ __html: description || "<span style='color: var(--muted)'>No description</span>" }}
              />
            </label>

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
