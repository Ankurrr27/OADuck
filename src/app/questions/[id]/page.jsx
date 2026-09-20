"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import AppHeader from "../../components/AppHeader";
import Sidebar from "../../components/Sidebar";
import PageLoader from "../../components/PageLoader";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <PageLoader />,
});

const difficultyColor = {
  Easy: "#22c55e",
  Medium: "#f59e0b",
  Hard: "#ef4444",
};

const languages = {
  javascript: {
    label: "JavaScript",
    fileName: "Solution.js",
    boilerplate: "function solve(input) {\n  // Write your solution here\n}\n",
  },
  typescript: {
    label: "TypeScript",
    fileName: "Solution.ts",
    boilerplate: "function solve(input: unknown): unknown {\n  // Write your solution here\n}\n",
  },
  python: {
    label: "Python",
    fileName: "solution.py",
    boilerplate: "def solve(input):\n    # Write your solution here\n    pass\n",
  },
  java: {
    label: "Java",
    fileName: "Solution.java",
    boilerplate: "class Solution {\n  public Object solve(Object input) {\n    // Write your solution here\n    return null;\n  }\n}\n",
  },
  cpp: {
    label: "C++",
    fileName: "solution.cpp",
    boilerplate: "#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\n public:\n  // Write your solution here\n};\n",
  },
};

export default function SolveQuestionPage() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [codeByLanguage, setCodeByLanguage] = useState(() => Object.fromEntries(
    Object.entries(languages).map(([key, value]) => [key, value.boilerplate])
  ));
  const [editorMessage, setEditorMessage] = useState("");
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function runCode() {
    setIsRunning(true);
    setEditorMessage("Running…");
    setOutput("");
    try {
      const response = await fetch("/api/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ problemId: id, language, code: codeByLanguage[language], stdin }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to run code.");
      const result = data.result;
      if (data.results) {
        setOutput(data.results.map((item, index) => `Sample ${index + 1}: ${item.passed ? "Passed" : item.result.verdict}\n${item.result.stdout || item.result.stderr || item.result.compileOutput || "No output."}`).join("\n\n"));
        setEditorMessage(`${data.results.filter((item) => item.passed).length}/${data.results.length} samples passed`);
      } else {
        setOutput(result.stdout || result.stderr || result.compileOutput || result.message || "No output.");
        setEditorMessage(result.verdict || result.status);
      }
    } catch (runError) {
      setOutput(runError.message);
      setEditorMessage("Run failed");
    } finally {
      setIsRunning(false);
    }
  }

  async function submitCode() {
    setIsSubmitting(true);
    setEditorMessage("Submitting sample tests…");
    setOutput("");
    try {
      const response = await fetch("/api/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ problemId: id, language, code: codeByLanguage[language] }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to submit code.");
      setOutput(`Passed: ${data.passedTests} / ${data.totalTests}\nRuntime: ${data.runtime ? `${Math.round(Number(data.runtime) * 1000)} ms` : "—"}`);
      setEditorMessage(data.status);
    } catch (submitError) {
      setOutput(submitError.message);
      setEditorMessage("Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    async function fetchQuestion() {
      const loadingStartedAt = Date.now();
      try {
        const res = await fetch(`/api/questions/${id}`);
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          setError(data.error || "Question not found.");
          return;
        }
        
        setQuestion(data.question);
      } catch (err) {
        setError("Failed to load question.");
      } finally {
        const remainingLoaderTime = Math.max(0, 500 - (Date.now() - loadingStartedAt));
        window.setTimeout(() => setLoading(false), remainingLoaderTime);
      }
    }
    if (id) fetchQuestion();
  }, [id]);

  if (loading) {
    return <PageLoader />;
  }

  if (error || !question) {
    return (
      <main className="min-h-screen bg-[#f5f4ef] text-[#17221e]">
        <AppHeader />
        <div className="flex min-h-[calc(100vh-60px)] ">
          <Sidebar />
          <section className="w-full max-w-[1200px] flex-1 mx-auto px-[clamp(24px,4vw,56px)] py-19" style={{ textAlign: 'center', paddingTop: '4rem' }}>
            <p>{error || "Question not found"}</p>
            <Link href="/questions" className="inline-flex min-h-10 items-center justify-center rounded-md border-0 bg-[#123f36] px-4 py-2 text-[13px] font-semibold text-[#f7f5ed] no-underline disabled:cursor-wait disabled:opacity-65" style={{ display: 'inline-block', marginTop: '1rem' }}>Back to Library</Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f4ef] text-[#17221e]">
      <AppHeader />
      <div className="solve-shell">
        <Sidebar />
        <div className="solve-workspace">
          <section className="problem-panel">
            <div className="problem-panel__heading">
              <span className="problem-panel__eyebrow">Problem {question.questionNumber}</span>
              <h1>{question.title}</h1>
            </div>
            
            <div className="problem-meta">
              <span className="difficulty-badge" style={{ background: `${difficultyColor[question.difficulty]}18`, color: difficultyColor[question.difficulty] }}>
                {question.difficulty}
              </span>
              {question.topics?.map(t => (
                <span className="topic-badge" key={t}>{t}</span>
              ))}
              {question.sourceUrl && (
                <a className="source-link" href={question.sourceUrl} target="_blank" rel="noopener noreferrer">
                  View Original Source ↗
                </a>
              )}
            </div>

            <div
              className="problem-description"
              dangerouslySetInnerHTML={{ __html: question.description }}
            />

            {question.examples?.length > 0 && (
              <div className="problem-section">
                <h2>Examples</h2>
                {question.examples.map((ex, i) => (
                  <pre className="example-card" key={i}>
                    {typeof ex === 'string' ? ex : JSON.stringify(ex, null, 2)}
                  </pre>
                ))}
              </div>
            )}

            {question.constraints?.length > 0 && (
              <div className="problem-section problem-section--last">
                <h2>Constraints</h2>
                <ul className="constraints-list">
                  {question.constraints.map((c, i) => (
                    <li key={i}>
                       {typeof c === 'string' ? c : JSON.stringify(c)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="editor-panel">
            <header className="editor-toolbar">
              <div className="editor-file">
                <span className="editor-file__dot" aria-hidden="true" />
                <span>{languages[language].fileName}</span>
                <label className="language-selector language-selector--toolbar" htmlFor="solution-language">
                  <span className="sr-only">Solution language</span>
                  <select id="solution-language" value={language} onChange={(event) => setLanguage(event.target.value)}>
                    {Object.entries(languages).filter(([key]) => key === "cpp").map(([key, item]) => <option value={key} key={key}>{item.label}</option>)}
                  </select>
                </label>
              </div>
              <div className="editor-actions">
                <button className="editor-button editor-button--quiet" onClick={() => setEditorMessage("Code saved locally for this session.")}>Save</button>
                <button className="editor-button editor-button--run" onClick={runCode} disabled={isRunning || isSubmitting}>{isRunning ? "Running…" : "Run"}</button>
                <button className="editor-button editor-button--submit" onClick={submitCode} disabled={isRunning || isSubmitting}>{isSubmitting ? "Submitting…" : "Submit"}</button>
              </div>
            </header>
            <div className="monaco-shell">
              <MonacoEditor
              height="100%"
              language={language}
              value={codeByLanguage[language]}
              onChange={(value) => setCodeByLanguage((current) => ({ ...current, [language]: value ?? "" }))}
              theme="vs-dark"
              options={{
                automaticLayout: true,
                fontSize: 14,
                fontFamily: "var(--font-geist-mono), monospace",
                lineHeight: 22,
                minimap: { enabled: false },
                padding: { top: 18, bottom: 18 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                tabSize: 2,
                wordWrap: "on",
              }}
              />
            </div>
            <div className="editor-console">
              <label htmlFor="code-stdin">Input <textarea id="code-stdin" value={stdin} onChange={(event) => setStdin(event.target.value)} placeholder="Optional stdin for Run" rows={2} /></label>
              <div className="editor-output" aria-live="polite"><span>Output</span><pre>{output || "Run your code to see output here."}</pre></div>
            </div>
            <footer className="editor-statusbar">
              <span>{editorMessage || "Ready"}</span>
              <div className="editor-statusbar__controls">
                <span>Spaces: 2</span>
              </div>
            </footer>
          </section>
        </div>
      </div>
    </main>
  );
}
