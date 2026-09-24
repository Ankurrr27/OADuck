"use client";

import { useEffect, useState } from "react";

export default function AssessmentRulesGate({ mode = "NORMAL", durationMinutes = 30, onBegin, isStarting = false, error = "", rulesReady = true }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState("");

  useEffect(() => {
    const updateFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", updateFullscreen);
    const frame = requestAnimationFrame(updateFullscreen);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("fullscreenchange", updateFullscreen);
    };
  }, []);

  async function enterFullscreen() {
    setFullscreenError("");
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    } catch {
      setFullscreenError("Your browser did not allow full screen. Use the full screen button or check your browser permissions.");
    }
  }

  return <div className="assessment-gate-backdrop">
    <section className="assessment-gate" role="dialog" aria-modal="true" aria-labelledby="assessment-gate-title">
      <p className="assessment-gate__eyebrow">Before you begin</p>
      <h1 id="assessment-gate-title">Session rules</h1>
      <p className="assessment-gate__intro">This session is {durationMinutes} minutes. Enter full screen to start, keep this tab active, and work in the editor during your session. You can click the header timer to switch between elapsed and remaining time.</p>
      <ul className="assessment-gate__rules">
        <li><strong>Copying and pasting</strong><span>Ctrl/Cmd+C and Ctrl/Cmd+V are blocked and count as violations.</span></li>
        <li><strong>Back navigation</strong><span>Using the browser Back button counts as a violation.</span></li>
        <li><strong>Switching tabs</strong><span>Leaving this tab counts as a violation.</span></li>
        <li className="assessment-gate__strict-rule"><strong>Full screen cannot be exited</strong><span>Exiting full screen immediately terminates your session on the first occurrence.</span></li>
        <li><strong>Other violation limit</strong><span>{mode === "STRICT" ? "The first copy, paste, Back-button, or tab-switch violation terminates the session." : "The first two copy, paste, Back-button, or tab-switch violations show warnings. The third terminates the session."}</span></li>
      </ul>
      <div className="assessment-gate__fullscreen"><strong>Verified full screen is required</strong><span>F11 hides browser controls in many browsers, but websites cannot verify that mode. Use the button below to enter full screen that this page can confirm.</span></div>
      {(fullscreenError || error) && <p className="assessment-gate__error" role="alert">{fullscreenError || error}</p>}
      <div className="assessment-gate__actions">
        {!isFullscreen ? <button type="button" className="assessment-gate__primary" onClick={enterFullscreen} disabled={!rulesReady}>{rulesReady ? "Enter verified full screen" : "Loading session rules…"}</button> : <button type="button" className="assessment-gate__primary" onClick={onBegin} disabled={isStarting || !rulesReady}>{isStarting ? "Starting session…" : !rulesReady ? "Loading session rules…" : "I understand — begin session"}</button>}
      </div>
      <p className="assessment-gate__note">This uses browser-level monitoring and cannot prevent every form of cheating.</p>
    </section>
  </div>;
}
