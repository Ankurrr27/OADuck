"use client";

import { useState, useEffect, useRef } from "react";
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
    boilerplate: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  // Read stdin, solve the problem, and write stdout.\n  return 0;\n}\n",
  },
};

function starterCodeForQuestion(question) {
  if (question?.title?.toLowerCase().includes("palindrome number")) {
    return `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    bool isPalindrome(int x) {
        if (x < 0) return false;
        string value = to_string(x);
        return equal(value.begin(), value.begin() + value.size() / 2, value.rbegin());
    }
};

int main() {
    int x;
    cin >> x;
    Solution solution;
    cout << boolalpha << solution.isPalindrome(x) << "\\n";
    return 0;
}

`;
  }
  return languages.cpp.boilerplate;
}

function SampleResultDetails({ results, selectedIndex, onSelect }) {
  const selected = results[selectedIndex] || results[0];
  const allPassed = results.every((item) => item.passed);
  return (
    <>
      <div className={`editor-sample-verdict ${allPassed ? "is-accepted" : "is-failed"}`}><strong>{allPassed ? "Accepted" : "Wrong Answer"}</strong><span>Runtime: {selected?.result?.time ? `${Math.round(Number(selected.result.time) * 1000)} ms` : "0 ms"}</span></div>
      <div className="editor-case-tabs">{results.map((item, index) => <button type="button" className={selectedIndex === index ? "editor-case-tab is-selected" : "editor-case-tab"} key={index} onClick={() => onSelect(index)}><span>{item.passed ? "✓" : "×"}</span> Case {index + 1}</button>)}</div>
      <div className={`editor-case-detail ${selected.passed ? "is-passed" : "is-failed"}`}>
        <label>Input</label><pre>{selected.input || "(empty)"}</pre>
        <label>Output</label><pre>{selected.result.stdout || selected.result.stderr || selected.result.compileOutput || "(empty)"}</pre>
        <label>Expected</label><pre>{selected.expectedOutput || "(empty)"}</pre>
      </div>
    </>
  );
}

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
  const [sampleResults, setSampleResults] = useState([]);
  const [selectedTestIndex, setSelectedTestIndex] = useState(0);
  const [submissionSummary, setSubmissionSummary] = useState(null);
  const [activeConsoleTab, setActiveConsoleTab] = useState("terminal");
  const [isOutputOpen, setIsOutputOpen] = useState(true);
  const [problemWidth, setProblemWidth] = useState(43);
  const [consoleHeight, setConsoleHeight] = useState(190);

  useEffect(() => {
    try {
      const savedLayout = JSON.parse(localStorage.getItem("oaduck-solve-layout") || "{}");
      if (Number.isFinite(savedLayout.problemWidth)) setProblemWidth(Math.min(65, Math.max(28, savedLayout.problemWidth)));
      if (Number.isFinite(savedLayout.consoleHeight)) setConsoleHeight(Math.min(520, Math.max(120, savedLayout.consoleHeight)));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("oaduck-solve-layout", JSON.stringify({ problemWidth, consoleHeight }));
  }, [problemWidth, consoleHeight]);

  function resizeProblemPane(event) {
    if (window.innerWidth < 721) return;
    event.preventDefault();
    const workspace = event.currentTarget.parentElement;
    const move = (moveEvent) => {
      const bounds = workspace.getBoundingClientRect();
      setProblemWidth(Math.min(65, Math.max(28, ((moveEvent.clientX - bounds.left) / bounds.width) * 100)));
    };
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop, { once: true });
  }

  function resizeConsole(event) {
    event.preventDefault();
    const workspace = event.currentTarget.closest(".editor-panel");
    const move = (moveEvent) => {
      const bounds = workspace.getBoundingClientRect();
      setConsoleHeight(Math.min(520, Math.max(120, bounds.bottom - moveEvent.clientY)));
    };
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop, { once: true });
  }

  function scrollProblemWithWheel(event) {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest("pre, textarea, select, input, button")) return;
    const panel = event.currentTarget;
    if (panel.scrollHeight <= panel.clientHeight) return;
    panel.scrollBy({ top: event.deltaY, behavior: "smooth" });
    event.preventDefault();
  }
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editorRef = useRef(null);

  async function runCode({ custom = false } = {}) {
    setIsRunning(true);
    setEditorMessage("Running…");
    setOutput("");
    setSampleResults([]);
    setSubmissionSummary(null);
    setIsOutputOpen(true);
    try {
      const response = await fetch("/api/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ problemId: id, language, code: codeByLanguage[language], stdin, custom }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to run code.");
      const result = data.result;
      if (data.results) {
        setSampleResults(data.results);
        setSelectedTestIndex(0);
        setActiveConsoleTab("tests");
        setOutput(data.results.map((item, index) => `Sample ${index + 1}: ${item.passed ? "Passed" : item.result.verdict}\n${item.result.stdout || item.result.stderr || item.result.compileOutput || "No output."}`).join("\n\n"));
        setEditorMessage(`${data.results.filter((item) => item.passed).length}/${data.results.length} samples passed`);
      } else {
        setActiveConsoleTab("terminal");
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
    setSampleResults([]);
    setIsOutputOpen(true);
    try {
      const response = await fetch("/api/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ problemId: id, language, code: codeByLanguage[language] }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to submit code.");
      setSubmissionSummary(data);
      setActiveConsoleTab("tests");
      setOutput(`Passed: ${data.passedTests} / ${data.totalTests}\nRuntime: ${data.runtime ? `${Math.round(Number(data.runtime) * 1000)} ms` : "—"}`);
      setEditorMessage(data.status);
    } catch (submitError) {
      setOutput(submitError.message);
      setEditorMessage("Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetSolution() {
    const starter = starterCodeForQuestion(question);
    setCodeByLanguage((current) => ({ ...current, cpp: starter }));
    editorRef.current?.setValue(starter);
    setStdin("");
    setOutput("");
    setSampleResults([]);
    setSubmissionSummary(null);
    setActiveConsoleTab("terminal");
    setEditorMessage("Solution reset to starter code.");
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

  // Replace the old non-compilable class-only starter that may still be held by HMR.
  useEffect(() => {
    if (!question) return;
    const starter = starterCodeForQuestion(question);
    setCodeByLanguage((current) => {
      const isUneditedStarter = !current.cpp || current.cpp === languages.cpp.boilerplate || current.cpp.includes("class Solution");
      return isUneditedStarter ? { ...current, cpp: starter } : current;
    });
  }, [question?.id]);

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
        <Sidebar compact />
        <div className="solve-workspace solve-workspace--resizable" style={{ "--problem-width": `${problemWidth}%` }}>
          <section className="problem-panel" onWheel={scrollProblemWithWheel} tabIndex={0}>
            <div className="problem-panel__heading">
              <span className="problem-panel__eyebrow">Problem {question.questionNumber}</span>
              <h1>{question.title}</h1>
            </div>
            
            <div className="problem-meta">
              {question.createdBy && <span className="topic-badge">Added by {question.createdBy.name || question.createdBy.email}</span>}
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

            {question.testCases?.some((testCase) => testCase.isSample) && (
              <div className="problem-section problem-section--last">
                <h2>Test cases</h2>
                <div className="saved-test-cases">
                  {question.testCases.filter((testCase) => testCase.isSample).map((testCase, index) => (
                    <div className="saved-test-case" key={testCase.id || index}>
                      <strong>Sample {index + 1}</strong>
                      <div><span>Input</span><pre>{testCase.input}</pre></div>
                      <div><span>Expected output</span><pre>{testCase.expectedOutput}</pre></div>
                    </div>
                  ))}
                </div>
            {(question.expectedTC || question.expectedSC) && (
              <div className="problem-section problem-section--last">
                <h2>Expected complexity</h2>
                {question.expectedTC && <p>Time: <strong>{question.expectedTC}</strong></p>}
                {question.expectedSC && <p>Space: <strong>{question.expectedSC}</strong></p>}
              </div>
            )}

            {question.hints?.length > 0 && (
              <div className="problem-section problem-section--last">
                <h2>Hints</h2>
                <ol className="constraints-list">
                  {question.hints.map((hint) => <li key={hint.id}>{hint.content || `Hint ${hint.hintOrder}`}</li>)}
                </ol>
              </div>
            )}

            {question.testCases?.length > 0 && (
              <div className="problem-section problem-section--last">
                <h2>Visible test cases</h2>
                <ul className="constraints-list">
                  {question.testCases.map((testCase, index) => (
                    <li key={testCase.id}>
                      <strong>Test case {index + 1}</strong>
                      <pre className="example-card">Input: {testCase.input}{"\n"}Output: {testCase.output}</pre>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <button className="pane-divider" type="button" onPointerDown={resizeProblemPane} aria-label="Resize question and editor panels" title="Drag to resize panels" />

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
                <button type="button" className="editor-button editor-button--quiet" onClick={resetSolution}>Reset solution</button>
                <button type="button" className="editor-button editor-button--quiet" onClick={() => setEditorMessage("Code saved locally for this session.")}>Save</button>
                <button type="button" className="editor-button editor-button--run" onClick={runCode} disabled={isRunning || isSubmitting}>{isRunning ? "Running…" : "Run"}</button>
                <button type="button" className="editor-button editor-button--submit" onClick={submitCode} disabled={isRunning || isSubmitting}>{isSubmitting ? "Submitting…" : "Submit"}</button>
              </div>
            </header>
            <div className="monaco-shell">
              <MonacoEditor
              height="100%"
              onMount={(editor) => { editorRef.current = editor; }}
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
            <button className="console-resize-handle" type="button" onPointerDown={resizeConsole} aria-label="Resize terminal output" title="Drag to resize terminal output" />
            <div className="editor-console" style={{ height: isOutputOpen ? `${consoleHeight}px` : "auto" }}>
              <div className="editor-output" aria-live="polite">
                <div className="editor-tabs" role="tablist" aria-label="Execution results">
                  <button type="button" className={activeConsoleTab === "terminal" ? "editor-tab editor-tab--active" : "editor-tab"} onClick={() => { setActiveConsoleTab("terminal"); setIsOutputOpen(true); }}>Terminal</button>
                  <button type="button" className={activeConsoleTab === "tests" ? "editor-tab editor-tab--active" : "editor-tab"} onClick={() => { setActiveConsoleTab("tests"); setIsOutputOpen(true); }}>Sample tests</button>
                </div>
                {activeConsoleTab === "terminal" ? (
                  <pre className="editor-terminal">{output || "Run your code to see terminal output here."}</pre>
                ) : (
                  <div className="editor-test-results">
                    {submissionSummary && <div className={`editor-test-summary ${submissionSummary.status === "Accepted" ? "is-accepted" : "is-failed"}`}><strong>{submissionSummary.status}</strong><span>Passed: {submissionSummary.passedTests} / {submissionSummary.totalTests}</span><span>Runtime: {submissionSummary.runtime ? `${Math.round(Number(submissionSummary.runtime) * 1000)} ms` : "0 ms"}</span></div>}
                    {sampleResults.length > 0 && <SampleResultDetails results={sampleResults} selectedIndex={selectedTestIndex} onSelect={setSelectedTestIndex} />}
                    {sampleResults.length > 0 ? sampleResults.map((item, index) => (
                      <div className={`editor-test-card ${item.passed ? "is-passed" : "is-failed"}`} key={index}>
                        <div className="editor-test-card__header"><strong><span>{item.passed ? "✓" : "×"}</span> Sample {index + 1}</strong><em>{item.passed ? "Passed" : item.result.verdict}</em></div>
                        <div className="editor-test-card__values">
                          <div><label>Input</label><pre>{item.input || "(empty)"}</pre></div>
                          <div><label>Expected output</label><pre>{item.expectedOutput || "(empty)"}</pre></div>
                          <div><label>Your output</label><pre>{item.result.stdout || item.result.stderr || item.result.compileOutput || "(empty)"}</pre></div>
                        </div>
                      </div>
                    )) : !submissionSummary && <div className="editor-test-empty">Run your code to see test results.</div>}
                  </div>
                )}
                <div className="custom-test-case">
                  <label htmlFor="code-stdin">Custom test case input</label>
                  <div className="custom-test-case__controls">
                    <textarea id="code-stdin" value={stdin} onChange={(event) => setStdin(event.target.value)} placeholder="Enter stdin for a custom Run" rows={2} />
                  <button type="button" className="editor-button editor-button--run" onClick={() => runCode({ custom: true })} disabled={isRunning || isSubmitting}>{isRunning ? "Running…" : "Run custom"}</button>
                  </div>
                </div>
              </div>
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
