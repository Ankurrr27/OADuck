"use client";

import { useEffect, useState } from "react";
import DuckLoader from "./components/DuckLoader";

const MINIMUM_LOADER_TIME = 500;

export default function Template({ children }) {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowLoader(false), MINIMUM_LOADER_TIME);
    return () => window.clearTimeout(timer);
  }, []);

  if (showLoader) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f4ef] px-6 text-[#17221e]">
        <DuckLoader large label="Getting OA Duck ready…" />
      </main>
    );
  }

  return children;
}
