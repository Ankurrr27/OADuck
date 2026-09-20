"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import DuckLoader from "./DuckLoader";

export default function NavigationDuck() {
  const pathname = usePathname();
  const [phase, setPhase] = useState("visible");
  const timerRef = useRef(null);
  const exitTimerRef = useRef(null);
  const pendingNavigationRef = useRef(false);

  const clearTimers = useCallback(() => {
    window.clearTimeout(timerRef.current);
    window.clearTimeout(exitTimerRef.current);
  }, []);

  const hideDuck = useCallback(() => {
    setPhase("leaving");
    exitTimerRef.current = window.setTimeout(() => setPhase("hidden"), 180);
  }, []);

  const showDuckFor = useCallback((duration) => {
    clearTimers();
    setPhase("visible");
    timerRef.current = window.setTimeout(hideDuck, duration);
  }, [clearTimers, hideDuck]);

  useEffect(() => {
    // A full browser refresh remounts this shared component, so keep the
    // centered loader visible briefly while the page settles.
    timerRef.current = window.setTimeout(hideDuck, 1000);

    function handleNavigation(event) {
      const link = event.target.closest("a[href]");
      if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || link.target === "_blank" || link.origin !== window.location.origin) return;

      pendingNavigationRef.current = true;
      showDuckFor(1500);
    }

    document.addEventListener("click", handleNavigation, true);
    return () => {
      document.removeEventListener("click", handleNavigation, true);
      clearTimers();
    };
  }, [clearTimers, hideDuck, showDuckFor]);

  useEffect(() => {
    if (!pendingNavigationRef.current) return;

    pendingNavigationRef.current = false;
    clearTimers();
    // Keep every route transition visually consistent with a full refresh.
    timerRef.current = window.setTimeout(hideDuck, 1000);
  }, [clearTimers, hideDuck, pathname]);

  if (phase === "hidden") return null;

  return (
    <div className={`navigation-duck ${phase === "leaving" ? "navigation-duck--leaving" : ""}`} aria-hidden="true">
      <DuckLoader />
    </div>
  );
}
