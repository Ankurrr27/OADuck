"use client";

import { useEffect, useRef, useState } from "react";
import DuckLoader from "./DuckLoader";

export default function NavigationDuck() {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    function showDuck(event) {
      const link = event.target.closest("a[href]");
      if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || link.target === "_blank" || link.origin !== window.location.origin) return;

      setVisible(true);
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setVisible(false), 420);
    }

    document.addEventListener("click", showDuck, true);
    return () => {
      document.removeEventListener("click", showDuck, true);
      window.clearTimeout(timerRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="navigation-duck" aria-hidden="true">
      <DuckLoader compact label="" />
    </div>
  );
}
