"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppHeader from "../../../components/AppHeader";
import Sidebar from "../../../components/Sidebar";
import { parseLeetCodeExamples } from "@/lib/leetcodeExamples";

export default function NewQuestionPage() {
  const router = useRouter();
  const fieldClass = "admin-create-field grid min-w-0 content-start gap-1 text-xs font-semibold text-[#526057]";
  const inputClass = "admin-create-input min-h-9 w-full rounded-md border border-[#d7dfd8] bg-white px-2.5 text-[13px] font-normal text-[#24352d] outline-none placeholder:text-[#a0aaa2] focus:border-[#6d9b86] focus:ring-2 focus:ring-[#176a5a]/10";
  const textareaClass = "admin-create-input w-full resize-y rounded-md border border-[#d7dfd8] bg-white px-2.5 py-2 text-[13px] leading-5 text-[#24352d] outline-none placeholder:text-[#a0aaa2] focus:border-[#6d9b86] focus:ring-2 focus:ring-[#176a5a]/10";
  const sectionClass = "admin-create-card min-w-0 rounded-lg border border-[#dfe1da] bg-[#fffefa] p-4";
  const secondaryButtonClass = "inline-flex min-h-8 w-fit items-center justify-center rounded-md border border-[#d8e2d9] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#315b48] transition hover:border-[#a7c1ad] hover:bg-[#f5f8f3]";

  // Form State
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [description, setDescription] = useState("");
  const [topics, setTopics] = useState("");
  const [constraints, setConstraints] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [expectedTC, setExpectedTC] = useState("");
  const [expectedSC, setExpectedSC] = useState("");
  const [hints, setHints] = useState("");

  const [optimalSolutions, setOptimalSolutions] = useState([
    { language: "JavaScript", code: "" },
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [testCaseMessage, setTestCaseMessage] = useState("");

  function fetchTestCasesFromDescription() {
    const parsed = parseLeetCodeExamples(description);
    if (!parsed.length) {
      setTestCaseMessage(
        "No Example input/output pairs found in the description.",
      );
      return;
    }
    setTestCases((current) => [
      ...parsed,
      ...current.filter((testCase) => !testCase.isSample),
    ]);
    setTestCaseMessage(
      `${parsed.length} sample test case${parsed.length === 1 ? "" : "s"} fetched.`,
    );
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
        topics: topics
          ? topics
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        examples: [],
        constraints,
        expectedTC,
        expectedSC,
        hints: hints
          .split("\n")
          .map((content) => ({ content }))
          .filter((hint) => hint.content.trim()),
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
    <main className="admin-page admin-create-page min-h-screen bg-[#f5f7f8] text-[#17221e]">
      <AppHeader />
      <div className="flex min-h-[calc(100vh-60px)] ">
        <Sidebar />
        <section className="admin-create-content mx-auto w-full max-w-[1440px] flex-1 px-[clamp(20px,3vw,40px)] py-6">
          <h1 className="admin-create-title">Add question</h1>

          <form className="grid w-full grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]" onSubmit={handleSave}>
            <section className={`${sectionClass} xl:col-span-2`}>
              <div className="mb-3 flex items-start gap-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#e8f1eb] font-mono text-[11px] font-bold text-[#176a5a]">01</span>
                <div>
                  <h2 className="m-0 text-base font-semibold text-[#24352d]">Question details</h2>
                  <p className="mt-0.5 text-xs text-[#7b867e]">Title, difficulty, and topics.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <label className={`${fieldClass} sm:col-span-2 xl:col-span-4`}>
                  Title
                  <input
                    className={inputClass}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Two Sum"
                    required
                  />
                </label>
                <label className={fieldClass}>
                  Difficulty
                  <select
                    className={inputClass}
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </label>
                <label className={`${fieldClass} xl:col-span-2`}>
                  Topics
                  <input
                    className={inputClass}
                    value={topics}
                    onChange={(e) => setTopics(e.target.value)}
                    placeholder="Array, Hash Table"
                  />
                </label>
              </div>
            </section>

            <section className={sectionClass}>
              <div className="mb-3 flex items-start gap-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#e8f1eb] font-mono text-[11px] font-bold text-[#176a5a]">02</span>
                <div>
                  <h2 className="m-0 text-base font-semibold text-[#24352d]">Problem content</h2>
                  <p className="mt-0.5 text-xs text-[#7b867e]">Write the prompt and supporting guidance.</p>
                </div>
              </div>
              <div className="grid gap-3">
                <label className={fieldClass}>
                  Description
                  <textarea
                    className={`${textareaClass} min-h-40`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={7}
                    placeholder="Describe the problem. HTML or plain text is supported."
                  />
                </label>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className={fieldClass}>
                    Constraints
                    <textarea
                      className={`${textareaClass} min-h-24`}
                      value={constraints.join("\n")}
                      onChange={(e) =>
                        setConstraints(
                          e.target.value.split("\n").filter(Boolean),
                        )
                      }
                      rows={4}
                      placeholder="1 ≤ n ≤ 10⁵"
                    />
                  </label>
                  <label className={fieldClass}>
                    Hints
                    <textarea
                      className={`${textareaClass} min-h-24`}
                      value={hints}
                      onChange={(e) =>
                        setHints(
                          e.target.value.split("\n").slice(0, 2).join("\n"),
                        )
                      }
                      rows={4}
                      placeholder="Guide the learner without giving away the answer"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className={fieldClass}>
                    Expected time complexity
                    <input
                      className={inputClass}
                      value={expectedTC}
                      onChange={(e) => setExpectedTC(e.target.value)}
                      placeholder="O(n)"
                    />
                  </label>
                  <label className={fieldClass}>
                    Expected space complexity
                    <input
                      className={inputClass}
                      value={expectedSC}
                      onChange={(e) => setExpectedSC(e.target.value)}
                      placeholder="O(1)"
                    />
                  </label>
                </div>
              </div>
            </section>

            <section className={sectionClass}>
              <div className="mb-3 flex items-start gap-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#e8f1eb] font-mono text-[11px] font-bold text-[#176a5a]">03</span>
                <div>
                  <h2 className="m-0 text-base font-semibold text-[#24352d]">Reference solutions</h2>
                  <p className="mt-0.5 text-xs text-[#7b867e]">Add an optimal solution for one or more languages.</p>
                </div>
              </div>
              <div className="grid gap-3">
                {optimalSolutions.map((solution, index) => (
                  <div className="grid gap-2.5 border-b border-[#e8ebe5] pb-3 last:border-b-0 last:pb-0" key={index}>
                    <div className="flex items-center justify-between text-xs font-semibold text-[#526057]">
                      <span>Solution {index + 1}</span>
                      <button
                        type="button"
                        className="min-h-7 border-0 bg-transparent px-2 text-xs font-semibold text-[#a3453a]"
                        onClick={() =>
                          setOptimalSolutions((current) =>
                            current.filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                    <label className={fieldClass}>
                      Language
                      <select
                        className={inputClass}
                        value={solution.language}
                        onChange={(event) =>
                          setOptimalSolutions((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, language: event.target.value }
                                : item,
                            ),
                          )
                        }
                      >
                        <option value="JavaScript">JavaScript</option>
                        <option value="TypeScript">TypeScript</option>
                        <option value="Python">Python</option>
                        <option value="Java">Java</option>
                        <option value="C++">C++</option>
                      </select>
                    </label>
                    <label className={fieldClass}>
                      Code
                      <textarea
                        className={`${textareaClass} min-h-36 bg-[#f8faf7] font-mono text-xs`}
                        value={solution.code}
                        onChange={(event) =>
                          setOptimalSolutions((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, code: event.target.value }
                                : item,
                            ),
                          )
                        }
                        rows={6}
                        placeholder="Paste the reference solution"
                      />
                    </label>
                  </div>
                ))}
                <button
                  type="button"
                  className={secondaryButtonClass}
                  onClick={() =>
                    setOptimalSolutions((current) => [
                      ...current,
                      { language: "JavaScript", code: "" },
                    ])
                  }
                >
                  + Add solution
                </button>
              </div>
            </section>

            <section className={`${sectionClass} xl:col-span-2`}>
              <div className="mb-3 flex items-start gap-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#e8f1eb] font-mono text-[11px] font-bold text-[#176a5a]">04</span>
                <div>
                  <h2 className="m-0 text-base font-semibold text-[#24352d]">Test cases</h2>
                  <p className="mt-0.5 text-xs text-[#7b867e]">
                    Sample cases are visible to learners. Hidden cases are used
                    for submission checks.
                  </p>
                </div>
              </div>
              <div className="grid gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="m-0 text-xs text-[#7b867e]">
                    {testCases.length} test{" "}
                    {testCases.length === 1 ? "case" : "cases"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={secondaryButtonClass}
                      onClick={fetchTestCasesFromDescription}
                    >
                      Fetch examples from description
                    </button>
                    <button
                      type="button"
                      className={secondaryButtonClass}
                      onClick={() =>
                        setTestCases((current) => [
                          ...current,
                          { input: "", expectedOutput: "", isSample: true },
                        ])
                      }
                    >
                      + Add test case
                    </button>
                  </div>
                </div>
                {testCaseMessage && (
                  <p className="m-0 text-xs text-[#176a5a]">
                    {testCaseMessage}
                  </p>
                )}
                {testCases.map((testCase, index) => (
                  <div className="grid gap-2 rounded-md border border-[#e3e9e2] bg-[#fafbf8] p-3" key={index}>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#526057]">
                      <strong>Case {index + 1}</strong>
                      <label className="ml-auto inline-flex items-center gap-1.5 font-medium">
                        <input
                          className="h-3.5 w-3.5 accent-[#176a5a]"
                          type="checkbox"
                          checked={testCase.isSample}
                          onChange={(e) =>
                            setTestCases((current) =>
                              current.map((item, i) =>
                                i === index
                                  ? { ...item, isSample: e.target.checked }
                                  : item,
                              ),
                            )
                          }
                        />{" "}
                        Sample / public
                      </label>
                      <button
                        type="button"
                        className="min-h-7 border-0 bg-transparent px-2 text-xs font-semibold text-[#a3453a]"
                        onClick={() =>
                          setTestCases((current) =>
                            current.filter((_, i) => i !== index),
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <label className={fieldClass}>
                        Input
                        <textarea
                          className={`${textareaClass} min-h-20 font-mono text-xs`}
                          rows={3}
                          placeholder="stdin"
                          value={testCase.input}
                          onChange={(e) =>
                            setTestCases((current) =>
                              current.map((item, i) =>
                                i === index
                                  ? { ...item, input: e.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                      </label>
                      <label className={fieldClass}>
                        Expected output
                        <textarea
                          className={`${textareaClass} min-h-20 font-mono text-xs`}
                          rows={3}
                          placeholder="stdout"
                          value={testCase.expectedOutput}
                          onChange={(e) =>
                            setTestCases((current) =>
                              current.map((item, i) =>
                                i === index
                                  ? { ...item, expectedOutput: e.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <footer className="admin-create-actions sticky bottom-0 z-10 flex items-center justify-end gap-2 rounded-md border border-[#dfe1da] bg-[#fffefa]/95 p-2 backdrop-blur xl:col-span-2">
              {saveError && <p className="mr-auto text-xs text-[#b33a32]" role="alert">{saveError}</p>}
              <Link
                href="/admin/questions"
                className="inline-flex min-h-9 items-center justify-center rounded-md border border-[#d8e2d9] px-3 text-xs font-semibold text-[#526057] no-underline"
              >
                Cancel
              </Link>
              <button
                className="inline-flex min-h-9 items-center justify-center rounded-md border border-[#123f36] bg-[#123f36] px-4 text-xs font-semibold text-white disabled:cursor-wait disabled:opacity-65"
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? "Saving…" : "Save question"}
              </button>
            </footer>
          </form>
        </section>
      </div>
    </main>
  );
}
