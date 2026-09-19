"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppHeader from "../../components/AppHeader";
import Sidebar from "../../components/Sidebar";

const difficultyColor = {
  Easy: "#22c55e",
  Medium: "#f59e0b",
  Hard: "#ef4444",
};

export default function SolveQuestionPage() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [code, setCode] = useState("// Write your solution here...\n");

  useEffect(() => {
    async function fetchQuestion() {
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
        setLoading(false);
      }
    }
    if (id) fetchQuestion();
  }, [id]);

  if (loading) {
    return (
      <main className="inner-page-shell">
        <AppHeader />
        <div className="dashboard-layout inner-page-layout">
          <Sidebar />
          <section className="inner-page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="q-loading-spinner" />
          </section>
        </div>
      </main>
    );
  }

  if (error || !question) {
    return (
      <main className="inner-page-shell">
        <AppHeader />
        <div className="dashboard-layout inner-page-layout">
          <Sidebar />
          <section className="inner-page-content" style={{ textAlign: 'center', paddingTop: '4rem' }}>
            <p>{error || "Question not found"}</p>
            <Link href="/questions" className="inner-page-button" style={{ display: 'inline-block', marginTop: '1rem' }}>Back to Library</Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="inner-page-shell">
      <AppHeader />
      <div className="dashboard-layout inner-page-layout" style={{ gridTemplateColumns: 'minmax(200px, 0.4fr) minmax(520px, 1.6fr)' }}>
        <Sidebar />
        
        {/* Workspace Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "calc(100vh - 72px)", overflow: "hidden", background: "#f8f9fa" }}>
          
          {/* Left panel: Problem Description */}
          <section style={{ padding: "1.5rem", overflowY: "auto", borderRight: "1px solid var(--line)", background: "#fff" }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
              <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{question.questionNumber}. {question.title}</h1>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="q-diff-badge" style={{ background: `${difficultyColor[question.difficulty]}18`, color: difficultyColor[question.difficulty] }}>
                {question.difficulty}
              </span>
              {question.topics?.map(t => (
                <span className="q-topic-chip" key={t}>{t}</span>
              ))}
              {question.sourceUrl && (
                <a href={question.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--green)', textDecoration: 'none', marginLeft: 'auto' }}>
                  View Original Source ↗
                </a>
              )}
            </div>

            <div 
              style={{ lineHeight: 1.6, color: "var(--ink)" }}
              dangerouslySetInnerHTML={{ __html: question.description }}
            />

            {question.examples?.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Examples</h3>
                {question.examples.map((ex, i) => (
                  <div key={i} style={{ background: '#f5f4ef', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                    {typeof ex === 'string' ? ex : JSON.stringify(ex, null, 2)}
                  </div>
                ))}
              </div>
            )}

            {question.constraints?.length > 0 && (
              <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Constraints</h3>
                <ul style={{ paddingLeft: '1.5rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                  {question.constraints.map((c, i) => (
                    <li key={i} style={{ marginBottom: '0.5rem' }}>
                       {typeof c === 'string' ? c : JSON.stringify(c)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Right panel: Code Editor */}
          <section style={{ display: 'flex', flexDirection: 'column', background: '#1e1e1e' }}>
            <div style={{ padding: '0.75rem 1rem', background: '#252526', color: '#ccc', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Solution.js</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{ background: 'transparent', color: '#ccc', border: '1px solid #444', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem' }}>Run</button>
                <button style={{ background: 'var(--green)', color: '#fff', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>Submit</button>
              </div>
            </div>
            <textarea 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{
                flex: 1,
                background: '#1e1e1e',
                color: '#d4d4d4',
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
                padding: '1rem',
                border: 'none',
                resize: 'none',
                outline: 'none',
                lineHeight: 1.5
              }}
              spellCheck="false"
            />
          </section>
          
        </div>
      </div>
    </main>
  );
}
