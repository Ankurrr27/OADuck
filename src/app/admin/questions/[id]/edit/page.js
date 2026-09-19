"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppHeader from "../../../../components/AppHeader";
import Sidebar from "../../../../components/Sidebar";

export default function EditQuestionPage() {
  const router = useRouter();
  const { id } = useParams();

  // Loading
  const [pageLoading, setPageLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

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
  const [questionNumber, setQuestionNumber] = useState(0);

  // Meta state
  const [leetcodeSlug, setLeetcodeSlug] = useState("");
  const [leetcodeId, setLeetcodeId] = useState("");
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
        setQuestionNumber(q.questionNumber);
        setLeetcodeSlug(q.leetcodeSlug || "");
        setLeetcodeId(q.leetcodeId || "");
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
    setSaveSuccess(false);

    try {
      const payload = {
        title,
        difficulty,
        description,
        topics: topics ? topics.split(",").map(t => t.trim()).filter(Boolean) : [],
        examples,
        constraints,
        source: source || "leetcode",
        sourceUrl,
        leetcodeSlug,
        leetcodeId,
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
    return (
      <main className="inner-page-shell">
        <AppHeader />
        <div className="dashboard-layout inner-page-layout">
          <Sidebar />
          <section className="inner-page-content admin-page-content" style={{ maxWidth: "800px" }}>
            <div className="q-loading">
              <div className="q-loading-spinner" />
              <span>Loading question...</span>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="inner-page-shell">
        <AppHeader />
        <div className="dashboard-layout inner-page-layout">
          <Sidebar />
          <section className="inner-page-content admin-page-content" style={{ maxWidth: "800px" }}>
            <p className="eyebrow">
              <Link href="/questions" style={{ textDecoration: "none", color: "inherit" }}>&larr; Back to Library</Link>
            </p>
            <div className="q-empty">
              <p>{loadError}</p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="inner-page-shell">
      <AppHeader />
      <div className="dashboard-layout inner-page-layout">
        <Sidebar />
        <section className="inner-page-content admin-page-content" style={{ maxWidth: "800px" }}>
          <p className="eyebrow">
            <Link href="/questions" style={{ textDecoration: "none", color: "inherit" }}>&larr; Back to Library</Link>
          </p>

          <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1>Edit question #{questionNumber}</h1>
              <p className="inner-page-lede">Update the problem details or re-import from LeetCode.</p>
            </div>
          </div>

          {/* Re-import section */}
          <div className="admin-stat-card" style={{ padding: "1.5rem", marginBottom: "3rem", display: "block" }}>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Re-import from LeetCode</h2>
            <form onSubmit={handleImport} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <input
                  className="auth-input"
                  style={{ margin: 0 }}
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://leetcode.com/problems/two-sum/"
                />
              </div>
              <button
                className="inner-page-button"
                type="submit"
                disabled={isImporting}
                style={{ marginTop: 0 }}
              >
                {isImporting ? "Fetching..." : "Re-import"}
              </button>
            </form>

            {importError && (
              <p className="auth-message" style={{ marginTop: "1rem", color: "#d32f2f" }}>{importError}</p>
            )}

            {importSuccess && (
              <p className="auth-message" style={{ marginTop: "1rem", color: "var(--green)" }}>Problem re-imported. Review and save below.</p>
            )}
          </div>

          <form className="profile-form" onSubmit={handleSave}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <label>
                Title
                <input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </label>

              <label>
                Difficulty
                <select
                  className="auth-input"
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
              Source URL
              <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://leetcode.com/problems/..." />
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
                className="inner-page-button"
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>

              {saveSuccess && (
                <p className="auth-message" style={{ margin: 0, color: "var(--green)" }}>Changes saved!</p>
              )}

              {saveError && (
                <p className="auth-message" style={{ margin: 0, color: "#d32f2f" }}>{saveError}</p>
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
