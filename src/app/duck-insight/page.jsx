"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AppHeader from "../components/AppHeader";
import Sidebar from "../components/Sidebar";

function InsightBody({ analysis, optimalCode }) {
  return <>
    {optimalCode && <section className="duck-insight-card duck-insight-card--lead"><p className="duck-insight-label">Reference Optimal Solution</p><pre className="duck-insight-code"><code>{optimalCode}</code></pre></section>}
    
    <section className="duck-insight-card"><p className="duck-insight-label">Optimal approach walkthrough</p><p>{analysis.approach}</p>
      <ol className="duck-insight-steps">{analysis.walkthrough?.map((step, index) => <li key={index}><strong>{step.title}</strong><p>{step.detail}</p></li>)}</ol>
    </section>
    
    <section className="duck-insight-card"><p className="duck-insight-label">Complexity</p><div className="duck-insight-complexity"><p><span>Time</span><strong>{analysis.complexity?.time}</strong></p><p><span>Space</span><strong>{analysis.complexity?.space}</strong></p></div><p>{analysis.complexity?.reason}</p></section>

    <section className="duck-insight-card"><p className="duck-insight-label">What went wrong in your code</p><p>{analysis.summary}</p>
      {analysis.bugs?.length > 0 && <ul>{analysis.bugs.map((bug, index) => <li key={index}>{bug}</li>)}</ul>}
    </section>

    {analysis.compilerOrRuntimeErrorAnalysis && <section className="duck-insight-card"><p className="duck-insight-label">Error analysis</p><p>{analysis.compilerOrRuntimeErrorAnalysis}</p></section>}

    {analysis.tests?.length > 0 && <section className="duck-insight-card"><p className="duck-insight-label">Example tests explained</p><div className="duck-insight-tests">{analysis.tests.map((test, index) => <article key={index}><h3>Example {index + 1}</h3><div className="duck-insight-test-grid"><div><span>Input</span><pre>{test.input}</pre></div><div><span>Expected output</span><pre>{test.expected}</pre></div></div><p>{test.explanation}</p></article>)}</div></section>}
  </>;
}

export default function DuckInsightPage() {
  const [pending, setPending] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [optimalCode, setOptimalCode] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const loaded = useRef(false);

  const [fallbackTC, setFallbackTC] = useState(null);
  const [fallbackSC, setFallbackSC] = useState(null);

  async function generate(payload) {
    setLoading(true);
    setError("");
    setFallbackTC(null);
    setFallbackSC(null);
    try {
      const response = await fetch("/api/duck-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.optimalCode) setOptimalCode(data.optimalCode);
        if (data.expectedTC) setFallbackTC(data.expectedTC);
        if (data.expectedSC) setFallbackSC(data.expectedSC);
        throw new Error(data.error || "Could not generate Duck Insight.");
      }
      setAnalysis(data.analysis);
      setOptimalCode(data.optimalCode);
    } catch (requestError) {
      setError(requestError.message || "Could not generate Duck Insight.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    try {
      const raw = sessionStorage.getItem("oaduck-duck-insight");
      sessionStorage.removeItem("oaduck-duck-insight");
      const payload = raw ? JSON.parse(raw) : null;
      if (!payload?.sessionId || !payload?.code) {
        setError("No submitted solution was provided. Open Duck Insight from an incorrect assessment result.");
        return;
      }
      setPending(payload);
      void generate(payload);
    } catch {
      setError("Could not read the temporary solution from this browser. Return to your result and try again.");
    }
  }, []);

  return <main className="min-h-screen bg-[#f5f4ef] text-[#17221e]">
    <AppHeader />
    <div className="flex min-h-[calc(100vh-60px)]">
      <Sidebar />
      <section className="w-full max-w-[1200px] flex-1 mx-auto px-[clamp(24px,4vw,56px)] py-8">
        <Link href="/questions" className="duck-insight-back">← Back to questions</Link>
        <p className="duck-insight-kicker">Duck Insight · Private, on-demand review</p>
        <h1>Your solution walkthrough</h1>
        <p className="duck-insight-intro">Understand the bug, learn the optimal approach, and see how it handles the examples.</p>
        
        {loading && <section className="duck-insight-state" role="status"><span className="duck-insight-spinner" /><h2>Reviewing your solution…</h2><p>Duck is comparing your submitted code with the problem and reference approach.</p></section>}
        
        {error && <section className="duck-insight-state duck-insight-state--error" role="alert">
          <h2>Insight unavailable</h2>
          <p>{error}</p>
          {pending && <button type="button" onClick={() => void generate(pending)}>Try again</button>}
        </section>}
        
        {/* Render fallback if AI failed but we got optimal code from DB */}
        {error && optimalCode && !analysis && (
          <div className="duck-insight-results mt-8">
            <section className="duck-insight-card duck-insight-card--lead"><p className="duck-insight-label">Reference Optimal Solution</p><pre className="duck-insight-code"><code>{optimalCode}</code></pre></section>
            {(fallbackTC || fallbackSC) && (
              <section className="duck-insight-card"><p className="duck-insight-label">Expected Complexity</p><div className="duck-insight-complexity"><p><span>Time</span><strong>{fallbackTC}</strong></p><p><span>Space</span><strong>{fallbackSC}</strong></p></div></section>
            )}
          </div>
        )}

        {analysis && <div className="duck-insight-results"><InsightBody analysis={analysis} optimalCode={optimalCode} /><p className="duck-insight-privacy">Your submitted code and the problem details were sent to the configured AI provider for this request. The app does not save the generated analysis to your account or database.</p></div>}
      </section>
    </div>
  </main>;
}
