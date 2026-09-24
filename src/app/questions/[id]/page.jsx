"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import dynamic from "next/dynamic";
import AppHeader from "../../components/AppHeader";
import Sidebar from "../../components/Sidebar";
import PageLoader from "../../components/PageLoader";
import AssessmentMonitor from "../../components/AssessmentMonitor";
import AssessmentRulesGate from "../../components/AssessmentRulesGate";
import AdminTestModeToggle from "../../components/AdminTestModeToggle";

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
  // Learners start with a clean editor. Saved solutions are only revealed
  // through the admin-only action rendered when the API returns them.
  return languages.cpp.boilerplate;
}

function SampleResultDetails({ results, hasRun, selectedIndex, onSelect, customAdded, customActive, customResult, onSelectCustom, onAddCustom, stdin, onStdinChange, onRunCustom, isRunning, isSubmitting, submissionVerdict }) {
  const selected = results[selectedIndex] || results[0];
  const allPassed = hasRun && results.every((item) => item.passed);
  const verdict = submissionVerdict || (allPassed ? "Accepted" : results.find((item) => !item.passed)?.result?.verdict || "Wrong Answer");
  return (
    <>
      {hasRun && <div className={`editor-sample-verdict ${verdict === "Accepted" ? "is-accepted" : "is-failed"}`}><strong>{verdict}</strong><span>{submissionVerdict ? `Passed: ${results.filter((item) => item.passed).length} / ${results.length} tests` : `Runtime: ${selected?.result?.time ? `${Math.round(Number(selected.result.time) * 1000)} ms` : "0 ms"}`}</span></div>}
      <div className="editor-case-tabs">{results.map((item, index) => <button type="button" className={!customActive && selectedIndex === index ? "editor-case-tab is-selected" : "editor-case-tab"} key={`${item.label || "case"}-${index}`} onClick={() => onSelect(index)}><span className={hasRun ? (item.passed ? "is-passed" : "is-failed") : "is-pending"}>{hasRun ? (item.passed ? "\u2713" : "\u00d7") : "\u00b7"}</span> {item.label || `Case ${index + 1}`}</button>)}{customAdded && <button type="button" className={`editor-case-tab editor-case-tab--custom ${customActive ? "is-selected" : ""}`} onClick={onSelectCustom}>Custom</button>}<button type="button" className="editor-case-add" onClick={onAddCustom} aria-label="Add custom test case" title="Add custom test case">+</button></div>
      {customActive ? <div className="editor-case-detail editor-case-detail--custom"><label htmlFor="code-stdin">Input</label><div className="editor-custom-case-inline__controls"><textarea id="code-stdin" value={stdin} onChange={(event) => onStdinChange(event.target.value)} placeholder="Enter your value" rows={1} /><button type="button" className="editor-button editor-button--run" onClick={onRunCustom} disabled={isRunning || isSubmitting}>{isRunning ? "Running..." : "Run"}</button></div>{customResult && <><label>Program output</label><pre>{customResult.result.stdout || "(empty)"}</pre>{(customResult.result.stderr || customResult.result.compileOutput || customResult.result.message) && <><label>Runner message</label><pre className="editor-case-diagnostic">{customResult.result.stderr || customResult.result.compileOutput || customResult.result.message}</pre></>}</>}</div> : selected.isHidden ? <div className={`editor-case-detail ${selected.passed ? "is-passed" : "is-failed"}`}><strong>{selected.verdict}</strong><p>Hidden test case details are not displayed.</p></div> : <div className={`editor-case-detail ${selected.passed ? "is-passed" : "is-failed"}`}>
        <label>Input</label><pre>{selected.input || "(empty)"}</pre>
        <label>Program output</label><pre>{hasRun ? (selected.result.stdout || "(empty)") : "Run code to see output"}</pre>
        {hasRun && (selected.result.stderr || selected.result.compileOutput || selected.result.message) && <><label>Runner message</label><pre className="editor-case-diagnostic">{selected.result.stderr || selected.result.compileOutput || selected.result.message}</pre></>}
        <label>Expected</label><pre>{selected.expectedOutput || "(empty)"}</pre>
      </div>}
    </>
  );
}

export default function SolveQuestionPage() {
  const { id } = useParams();
  const { data: authSession } = useSession();
  const isAdmin = authSession?.user?.role === "ADMIN";
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assessment, setAssessment] = useState(null);
  const [assessmentError, setAssessmentError] = useState("");
  const [assessmentMode, setAssessmentMode] = useState("NORMAL");
  const [assessmentDurationMinutes, setAssessmentDurationMinutes] = useState(30);
  const [assessmentRulesReady, setAssessmentRulesReady] = useState(false);
  const [isAssessmentStarting, setIsAssessmentStarting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [completionRequested, setCompletionRequested] = useState(false);
  const [isEndingAssessment, setIsEndingAssessment] = useState(false);
  const [endAssessmentError, setEndAssessmentError] = useState("");
  const [adminTestMode, setAdminTestMode] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [language, setLanguage] = useState("cpp");
  const [codeByLanguage, setCodeByLanguage] = useState(() => Object.fromEntries(
    Object.entries(languages).map(([key, value]) => [key, value.boilerplate])
  ));
  const [editorMessage, setEditorMessage] = useState("");
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");
  const [sampleResults, setSampleResults] = useState([]);
  const [customResult, setCustomResult] = useState(null);
  const [selectedTestIndex, setSelectedTestIndex] = useState(0);
  const [customCaseAdded, setCustomCaseAdded] = useState(false);
  const [customCaseActive, setCustomCaseActive] = useState(false);
  const [submissionSummary, setSubmissionSummary] = useState(null);
  const submittedCodeRef = useRef(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState("tests");
  const [isOutputOpen, setIsOutputOpen] = useState(true);
  const [problemWidth, setProblemWidth] = useState(40);
  const [consoleHeight, setConsoleHeight] = useState(132);

  useEffect(() => {
    const updateFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", updateFullscreen);
    const frame = requestAnimationFrame(updateFullscreen);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("fullscreenchange", updateFullscreen);
    };
  }, []);
  const visibleSampleCases = sampleResults.length > 0
    ? sampleResults
    : (question?.testCases || []).filter((testCase) => testCase.isSample).map((testCase) => ({
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      passed: false,
      result: {},
    }));

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
  const submissionPassed = submissionSummary?.status === "Accepted"
    && submissionSummary.passedTests === submissionSummary.totalTests
    && submissionSummary.totalTests > 0;
  const submissionWrongAnswer = String(submissionSummary?.status).toLowerCase() === "wrong answer";

  async function runCode({ custom = false } = {}) {
    setIsRunning(true);
    setEditorMessage("Running…");
    setOutput("");
    if (!custom) setSampleResults([]);
    if (custom) setCustomResult(null);
    setSubmissionSummary(null);
    setIsOutputOpen(true);
    try {
      const response = await fetch("/api/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ problemId: id, language, code: codeByLanguage[language], stdin, custom }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to run code.");
      const result = data.result;
      if (custom) {
        setCustomResult({ input: stdin, result });
        setCustomCaseAdded(true);
        setCustomCaseActive(true);
        setActiveConsoleTab("tests");
        setEditorMessage(result.verdict || result.status);
        return;
      }
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
    if (!assessment || sessionCompleted) return null;
    setIsSubmitting(true);
    setEditorMessage("Submitting test cases...");
    setSubmissionSummary(null);
    setSampleResults([]);
    setSelectedTestIndex(0);
    setIsOutputOpen(true);
    try {
      const response = await fetch("/api/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ problemId: id, assessmentId: assessment?.id, language, code: codeByLanguage[language] }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to submit code.");
      setSubmissionSummary(data);
      setSampleResults(data.testResults || []);
      setSelectedTestIndex(0);
      setCustomCaseActive(false);
      submittedCodeRef.current = codeByLanguage[language];
      setActiveConsoleTab("tests");
      setOutput(data.terminalOutput || "");
      setEditorMessage(data.status);
      return data;
    } catch (submitError) {
      setEditorMessage("Submission failed");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function endAssessment() {
    if (!assessment || sessionCompleted || isEndingAssessment) return;
    setShowSuccessDialog(false);
    setCompletionRequested(true);
    setEndAssessmentError("");
  }

  async function confirmEndAssessment() {
    if (!assessment || isEndingAssessment) return;
    setIsEndingAssessment(true);
    try {
      const submission = await submitCode();
      if (!submission) {
        setEndAssessmentError("Code could not be submitted. Review the submission error, then try again.");
        return;
      }
      const response = await fetch(`/api/assessments/${assessment.id}/end`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to end assessment.");
      if (Number.isFinite(data.violationCount)) setViolationCount(data.violationCount);
      setSessionCompleted(true);
      setCompletionRequested(false);
      setShowSuccessDialog(true);
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    } catch (endError) {
      setEndAssessmentError(endError.message);
      setOutput(endError.message);
      setEditorMessage("Could not end assessment");
    } finally {
      setIsEndingAssessment(false);
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

  function toggleSolution() {
    const savedSolution = question?.optimalSolutions?.find((solution) => {
      const value = String(solution.language || "").toLowerCase();
      return value === "cpp" || value.includes("c++");
    });
    if (!savedSolution) return;
    const nextShow = !showSolution;
    const nextCode = nextShow ? savedSolution.code : starterCodeForQuestion(question);
    setShowSolution(nextShow);
    setCodeByLanguage((current) => ({ ...current, cpp: nextCode }));
    editorRef.current?.setValue(nextCode);
  }

  async function startAssessment() {
    if (!isFullscreen || isAssessmentStarting) return;
    setIsAssessmentStarting(true);
    setAssessmentError("");
    try {
      const response = await fetch("/api/assessments/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not start assessment.");
      setAssessment({ id: data.assessmentId, mode: data.mode, startedAt: data.startedAt, durationMinutes: data.durationMinutes });
      setAssessmentMode(data.mode);
      setAssessmentRulesReady(true);
      setViolationCount(data.count || 0);
    } catch (startError) {
      setAssessmentError(startError.message || "Could not start assessment.");
    } finally {
      setIsAssessmentStarting(false);
    }
  }

  async function reenterFullscreen() {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      setEditorMessage("Use your browser full screen control to resume the session.");
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
        fetch("/api/assessments/start")
          .then((response) => response.ok ? response.json() : null)
          .then((settings) => {
            if (settings?.mode) setAssessmentMode(settings.mode);
            if (settings?.durationMinutes) setAssessmentDurationMinutes(settings.durationMinutes);
          })
          .catch(() => {})
          .finally(() => setAssessmentRulesReady(true));
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
      {assessment && <AssessmentMonitor assessmentId={assessment.id} mode={assessment.mode} enabled={!sessionCompleted} violationCount={violationCount} onViolationUpdate={setViolationCount} adminTestMode={adminTestMode} />}
      {assessment && !isFullscreen && !sessionCompleted && <div className="assessment-fullscreen-hold"><section role="alertdialog" aria-modal="true"><h2>Full screen required</h2><p>Return to full screen to continue your assessment.</p><button type="button" onClick={reenterFullscreen}>Resume full screen</button></section></div>}
      {!assessment && <AssessmentRulesGate mode={assessmentMode} durationMinutes={assessmentDurationMinutes} onBegin={startAssessment} isStarting={isAssessmentStarting} error={assessmentError} rulesReady={assessmentRulesReady} />}
      {completionRequested && !sessionCompleted && <div className="submission-success-backdrop"><section className="submission-success" role="alertdialog" aria-modal="true" aria-labelledby="end-assessment-title"><h2 id="end-assessment-title">Do you want to end the assessment?</h2><p className="submission-success__name">Your current code will be submitted before the assessment closes. You will then see your results and can go to Home or Stats.</p>{endAssessmentError && <p className="assessment-gate__error" role="alert">{endAssessmentError}</p>}<div className="assessment-completion-actions"><button type="button" className="submission-success__button" onClick={() => setCompletionRequested(false)} disabled={isEndingAssessment}>Keep working</button><button type="button" className="submission-success__button" onClick={confirmEndAssessment} disabled={isEndingAssessment}>{isEndingAssessment ? "Submitting and ending…" : "Yes, submit and end"}</button></div></section></div>}
      {showSuccessDialog && submissionSummary && (
        <div className="submission-success-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowSuccessDialog(false); }}>
          <section className="submission-success" role="dialog" aria-modal="true" aria-labelledby="submission-success-title">
            <button className="submission-success__close" type="button" onClick={() => setShowSuccessDialog(false)} aria-label="Close submission summary">×</button>
            <div className={`submission-success__icon ${submissionWrongAnswer ? "submission-success__icon--failed" : submissionPassed ? "" : "submission-success__icon--neutral"}`} aria-hidden="true">{submissionPassed ? "\u2713" : submissionWrongAnswer ? "\u00d7" : "!"}</div>
            <p className="submission-success__eyebrow">Problem {submissionSummary.questionNumber || question.questionNumber} · {submissionSummary.status}</p>
            <h2 id="submission-success-title">{sessionCompleted ? "Assessment ended" : "Submission results"}</h2>
            <p className="submission-success__name">{submissionSummary.questionTitle || question.title}</p>
            <div className="submission-success__stats">
              <div><span>Tests passed</span><strong>{submissionSummary.passedTests}/{submissionSummary.totalTests}</strong></div>
              <div><span>Attempts</span><strong>{submissionSummary.attempts}</strong></div>
              <div><span>Time complexity</span><strong>{submissionSummary.expectedTC || "Not specified"}</strong></div>
              <div><span>Space complexity</span><strong>{submissionSummary.expectedSC || "Not specified"}</strong></div>
              <div><span>Runtime</span><strong>{submissionSummary.runtime ? `${Math.round(Number(submissionSummary.runtime) * 1000)} ms` : "—"}</strong></div>
              <div><span>Memory</span><strong>{submissionSummary.memory ? `${Math.round(Number(submissionSummary.memory) / 1024)} MB` : "—"}</strong></div>
            </div>
            <div className="assessment-completion-extra"><span>Violations this session</span><strong>{violationCount}</strong></div>
            <p className="assessment-completion-note">{sessionCompleted ? "Your session results and violation total have been saved to Stats." : completionRequested ? "Review your final submission, then confirm to close the assessment." : "Your session is still active. Submit again after editing, or end the assessment when you are ready."}</p>
            {sessionCompleted ? <div className="assessment-completion-actions"><Link href="/" className="submission-success__button" onClick={() => { if (document.fullscreenElement) void document.exitFullscreen().catch(() => {}); }}>Home</Link><Link href="/stats" className="submission-success__button" onClick={() => { if (document.fullscreenElement) void document.exitFullscreen().catch(() => {}); }}>View stats</Link></div> : <div className="assessment-completion-actions">{completionRequested ? <button type="button" className="submission-success__button" onClick={confirmEndAssessment} disabled={isEndingAssessment}>{isEndingAssessment ? "Ending assessment…" : "Confirm end assessment"}</button> : <button type="button" className="submission-success__button" onClick={() => setShowSuccessDialog(false)}>Continue assessment</button>}</div>}
          </section>
        </div>
      )}
      <AppHeader assessmentTimer={assessment ? { startedAt: assessment.startedAt, durationMinutes: assessment.durationMinutes } : null} />
      <div className="solve-shell">
        {!assessment && <Sidebar compact />}
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
                  View Original Source â†—
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
                </div>
            )}
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
                {assessment && isAdmin && <AdminTestModeToggle assessmentId={assessment.id} enabled={adminTestMode} onChange={setAdminTestMode} />}
                <button type="button" className="editor-button editor-button--quiet" onClick={resetSolution}>Reset solution</button>
                {question.optimalSolutions?.length > 0 && <button type="button" className="editor-button editor-button--quiet" onClick={toggleSolution}>{showSolution ? "Hide solution" : "Show solution"}</button>}
                <button type="button" className="editor-button editor-button--quiet" onClick={() => setEditorMessage("Code saved locally for this session.")}>Save</button>
                <button type="button" className="editor-button editor-button--run" onClick={runCode} disabled={isRunning || isSubmitting}>{isRunning ? "Running…" : "Run"}</button>
                <button type="button" className="editor-button editor-button--submit" onClick={submitCode} disabled={isRunning || isSubmitting || sessionCompleted}>{sessionCompleted ? "Session complete" : isSubmitting ? "Submitting…" : "Submit"}</button>
                {assessment && <button type="button" className="editor-button editor-button--quiet" onClick={endAssessment} disabled={isRunning || isSubmitting || sessionCompleted || isEndingAssessment}>{isEndingAssessment ? "Ending…" : "End assessment"}</button>}
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
                  <button type="button" className={activeConsoleTab === "tests" ? "editor-tab editor-tab--active" : "editor-tab"} onClick={() => { setActiveConsoleTab("tests"); setIsOutputOpen(true); }}>✓ Testcase</button>
                  <button type="button" className={activeConsoleTab === "terminal" ? "editor-tab editor-tab--active" : "editor-tab"} onClick={() => { setActiveConsoleTab("terminal"); setIsOutputOpen(true); }}><svg className="editor-tab__icon" aria-hidden="true" viewBox="0 0 20 20"><path d="m6 4 6 6-6 6M13 16h4" /></svg>Test Result</button>
                </div>
                {activeConsoleTab === "terminal" ? (
                  <pre className="editor-terminal">{output || "Run your code to see terminal output here."}</pre>
                ) : (
                  <div className="editor-test-results">
                    {submissionSummary && <div className={`editor-submission-result ${submissionSummary.status === "Accepted" ? "is-accepted" : "is-failed"}`}>
                      <div className="editor-submission-result__headline"><strong>{submissionSummary.status}</strong><span>Passed: {submissionSummary.passedTests} / {submissionSummary.totalTests} test cases</span><span>Runtime: {submissionSummary.runtime ? `${Math.round(Number(submissionSummary.runtime) * 1000)} ms` : "0 ms"}</span></div>
                      {submissionSummary.failedTestNumber && <div className="editor-submission-result__failed">Failed on test case {submissionSummary.failedTestNumber}. Hidden test details are not shown.</div>}
                    </div>}
                    {visibleSampleCases.length > 0 && <SampleResultDetails results={visibleSampleCases} hasRun={sampleResults.length > 0} selectedIndex={selectedTestIndex} onSelect={(index) => { setSelectedTestIndex(index); setCustomCaseActive(false); }} customAdded={customCaseAdded} customActive={customCaseActive} customResult={customResult} onSelectCustom={() => setCustomCaseActive(true)} onAddCustom={() => { setCustomCaseAdded(true); setCustomCaseActive(true); }} stdin={stdin} onStdinChange={setStdin} onRunCustom={() => runCode({ custom: true })} isRunning={isRunning} isSubmitting={isSubmitting} submissionVerdict={submissionSummary?.status} />}
                    {visibleSampleCases.length === 0 && !submissionSummary && <div className="editor-test-empty">No sample test cases are configured for this question.</div>}
                    {sampleResults.filter((item) => !item.isHidden).length > 0 ? sampleResults.filter((item) => !item.isHidden).map((item, index) => (
                      <div className={`editor-test-card ${item.passed ? "is-passed" : "is-failed"}`} key={index}>
                        <div className="editor-test-card__header"><strong><span>{item.passed ? "✓" : "×"}</span> Sample {index + 1}</strong><em>{item.passed ? "Passed" : item.result.verdict}</em></div>
                        <div className="editor-test-card__values">
                          <div><label>Input</label><pre>{item.input || "(empty)"}</pre></div>
                          <div><label>Expected output</label><pre>{item.expectedOutput || "(empty)"}</pre></div>
                          <div><label>Your output</label><pre>{item.result.stdout || item.result.stderr || item.result.compileOutput || "(empty)"}</pre></div>
                        </div>
                      </div>
                    )) : null}
                  </div>
                )}
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
