"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const LABELS = {
  COPY: "Copy",
  PASTE: "Paste",
  BACK_NAVIGATION: "Back button navigation",
  TAB_SWITCH: "Tab switching",
  FULLSCREEN_EXIT: "Exited full screen",
};

export function useAssessmentMonitoring({ assessmentId, mode, enabled, onTerminated, onViolationUpdate }) {
  const [notice, setNotice] = useState(null);
  const [terminated, setTerminated] = useState(false);
  const lastEventRef = useRef({});
  const guardPushedRef = useRef(false);
  const onTerminatedRef = useRef(onTerminated);
  const onViolationUpdateRef = useRef(onViolationUpdate);
  useEffect(() => { onTerminatedRef.current = onTerminated; }, [onTerminated]);
  useEffect(() => { onViolationUpdateRef.current = onViolationUpdate; }, [onViolationUpdate]);

  const recordViolation = useCallback(async (type) => {
    if (!assessmentId || !enabled || terminated) return;
    const now = Date.now();
    if (now - (lastEventRef.current[type] || 0) < 150) return;
    lastEventRef.current[type] = now;

    try {
      const response = await fetch(`/api/assessments/${assessmentId}/violations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
        keepalive: true,
      });
      const result = await response.json();
      if (!response.ok) return;
      setNotice({ type, count: result.count, max: result.maxViolations || 3, mode: result.mode || mode, terminated: result.terminated, adminTestMode: result.adminTestMode });
      onViolationUpdateRef.current?.(result.count);
      if (result.terminated) {
        setTerminated(true);
        onTerminatedRef.current?.();
      }
    } catch {
      // Browser monitoring is best effort; only a server response changes the count.
    }
  }, [assessmentId, enabled, mode, terminated]);

  useEffect(() => {
    if (!assessmentId || !enabled || terminated) return;
    const onKeyDown = (event) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key === "c" || key === "v") {
        event.preventDefault();
        void recordViolation(key === "c" ? "COPY" : "PASTE");
      }
    };
    const onCopy = (event) => { event.preventDefault(); void recordViolation("COPY"); };
    const onPaste = (event) => { event.preventDefault(); void recordViolation("PASTE"); };
    const onVisibility = () => {
      if (document.hidden) void recordViolation("TAB_SWITCH");
    };
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) void recordViolation("FULLSCREEN_EXIT");
    };
    const onPopState = () => {
      void recordViolation("BACK_NAVIGATION");
      history.pushState({ assessmentGuard: true }, "", location.href);
    };

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("copy", onCopy, true);
    document.addEventListener("paste", onPaste, true);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    if (!guardPushedRef.current) {
      history.pushState({ assessmentGuard: true }, "", location.href);
      guardPushedRef.current = true;
    }
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("copy", onCopy, true);
      document.removeEventListener("paste", onPaste, true);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("popstate", onPopState);
    };
  }, [assessmentId, enabled, terminated, recordViolation]);

  return { notice, terminated, clearNotice: () => setNotice(null) };
}

export default function AssessmentMonitor({ assessmentId, mode, enabled, onTerminated, onViolationUpdate, violationCount = 0, adminTestMode = false }) {
  const { notice, terminated, clearNotice } = useAssessmentMonitoring({ assessmentId, mode, enabled, onTerminated, onViolationUpdate });
  const leaveFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
  };
  if (terminated) {
    return <div className="assessment-terminated" role="alert"><section><span aria-hidden="true">!</span><h1>Assessment Terminated</h1><p>{notice?.type === "FULLSCREEN_EXIT" ? "You exited full screen. This session was terminated immediately." : "This assessment has ended because its violation limit was reached. Code submissions are disabled."}</p><p className="assessment-terminated__count">Violations in this session: <strong>{violationCount}</strong></p><nav className="assessment-terminated__actions"><Link href="/" onClick={leaveFullscreen}>Home</Link><Link href="/stats" onClick={leaveFullscreen}>View stats</Link></nav></section></div>;
  }
  if (!notice) return null;
  const nextTerminates = notice.mode === "STRICT" || notice.count >= notice.max - 1;
  return <div className="assessment-warning" role="alertdialog" aria-live="assertive" aria-label="Assessment violation warning">
    <div><strong>{LABELS[notice.type]} violation</strong><p>Violation {notice.count} of {notice.max}. {notice.adminTestMode || adminTestMode ? "Admin test mode is on: this violation is recorded and will not terminate your session." : nextTerminates ? "The next violation will terminate the assessment." : "The assessment will continue."}</p></div>
    <button type="button" onClick={clearNotice} aria-label="Dismiss warning">Dismiss</button>
  </div>;
}
