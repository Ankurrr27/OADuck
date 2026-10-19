"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import AppHeader from "../components/AppHeader";

const difficulties = ["Any difficulty", "Easy", "Medium", "Hard"];

export default function PracticePage() {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [topic, setTopic] = useState("Any topic");
  const [difficulty, setDifficulty] = useState("Any difficulty");
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadQuestions() {
      try {
        const response = await fetch("/api/questions");
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error || "Could not load questions.");
        if (active) setQuestions(result.questions);
      } catch (loadError) {
        if (active) setError(loadError.message || "Could not load questions.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadQuestions();
    return () => { active = false; };
  }, []);

  const topics = [...new Set(questions.flatMap((question) => question.topics || []))].sort((a, b) => a.localeCompare(b));

  function startPractice(event) {
    event.preventDefault();
    const matchingQuestions = questions.filter((question) =>
      (topic === "Any topic" || question.topics?.includes(topic))
      && (difficulty === "Any difficulty" || question.difficulty === difficulty),
    );

    if (!matchingQuestions.length) {
      setError("No questions match those choices. Try another topic or difficulty.");
      return;
    }

    const question = matchingQuestions[Math.floor(Math.random() * matchingQuestions.length)];
    setStarting(true);
    router.push(`/questions/${question.id}`);
  }

  const selectClass = "min-h-10 w-full rounded-md border border-white/20 bg-[#0c342d] px-3 text-sm text-white outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/20";

  return (
    <main className="h-[calc(100dvh-3.5rem)] overflow-hidden bg-[#f5f4ef] text-[#17221e]">
      <AppHeader />
      <div className="flex min-h-[calc(100dvh-3.5rem)]">
        <Sidebar />
        <section className="flex w-full flex-1">
          <div className="relative isolate flex min-h-[calc(100dvh-3.5rem)] w-full items-center overflow-hidden bg-[#123f36] px-5 py-8 text-white sm:px-9 sm:py-10 lg:px-12">
            <div className="pointer-events-none absolute -right-[450px] top-1/2 z-0 h-[1120px] w-[1120px] -translate-y-1/2 rounded-full bg-[#123f36] max-md:-right-[200px] max-md:h-[620px] max-md:w-[620px]" aria-hidden="true">
              <div className="absolute inset-[40px] rounded-full bg-[#17483e] max-md:inset-[20px]">
                <div className="absolute inset-[40px] rounded-full bg-[#1b5145] max-md:inset-[20px]">
                  <div className="absolute inset-[40px] rounded-full bg-[#205a4d] max-md:inset-[20px]">
                    <div className="absolute inset-[40px] rounded-full bg-[#286756] max-md:inset-[20px]">
                      <div className="absolute inset-[40px] rounded-full bg-[#337764] max-md:inset-[20px]">
                        <div className="absolute inset-[40px] rounded-full bg-[#438774] max-md:inset-[20px]">
                          <div className="absolute inset-[40px] rounded-full bg-[#579783] max-md:inset-[20px]">
                            <div className="absolute inset-[40px] rounded-full bg-[#6fa895] max-md:inset-[20px]">
                              <div className="absolute inset-[40px] rounded-full bg-[#8bbdab] max-md:inset-[20px]">
                                <div className="absolute inset-[40px] rounded-full bg-[#9ccab7] max-md:inset-[20px]">
                                  <div className="absolute inset-[40px] rounded-full bg-[#b0d6c5] max-md:inset-[20px]">
                                    <div className="absolute inset-[40px] rounded-full bg-[#c6e4d3] max-md:inset-[20px]">
                                      <div className="absolute inset-[40px] rounded-full bg-[#cde5d9] max-md:inset-[20px]" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 w-full max-w-4xl">
              <h1 className="m-0 max-w-3xl text-5xl font-semibold leading-tight text-white sm:text-6xl">Start your practice and sharpen your problem-solving skills.</h1>
              <p className="mb-0 mt-4 max-w-3xl text-lg leading-8 text-emerald-100 sm:mt-5 sm:text-2xl">Choose a topic and difficulty, then jump into a focused challenge picked from your problem library. Keep practicing, build consistency, and turn every attempt into progress.</p>

              <form className="mt-6 grid gap-3 sm:mt-8 sm:w-fit sm:grid-cols-[minmax(180px,230px)_minmax(180px,230px)_auto] sm:items-end" onSubmit={startPractice}>
                <label className="grid gap-1.5 text-xs font-semibold text-emerald-50">
                  Topic
                  <select className={selectClass} style={{ color: "#f7f5ed", backgroundColor: "#0c342d" }} value={topic} onChange={(event) => { setTopic(event.target.value); setError(""); }} disabled={loading || starting}>
                    <option style={{ color: "#17221e", backgroundColor: "#fffefa" }}>Any topic</option>
                    {topics.map((value) => <option style={{ color: "#17221e", backgroundColor: "#fffefa" }} key={value}>{value}</option>)}
                  </select>
                </label>
                <label className="grid gap-1.5 text-xs font-semibold text-emerald-50">
                  Difficulty
                  <select className={selectClass} style={{ color: "#f7f5ed", backgroundColor: "#0c342d" }} value={difficulty} onChange={(event) => { setDifficulty(event.target.value); setError(""); }} disabled={loading || starting}>
                    {difficulties.map((value) => <option style={{ color: "#17221e", backgroundColor: "#fffefa" }} key={value}>{value}</option>)}
                  </select>
                </label>
                <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#f7f5ed] px-5 text-sm font-bold text-[#123f36] transition hover:bg-white disabled:cursor-wait disabled:opacity-70 sm:px-6" type="submit" disabled={loading || starting || !questions.length}>
                  {loading ? "Loading…" : starting ? "Starting…" : "Start practice"}<span aria-hidden="true">→</span>
                </button>
              </form>

              {error && <p className="mb-0 mt-4 rounded-md border border-rose-200/25 bg-rose-950/20 px-3 py-2 text-xs text-rose-100" role="alert">{error}</p>}

            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
