"use client";

import { useEffect } from "react";
import Link from "next/link";
import BrandLogo from "./components/BrandLogo";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "var(--bg)",
      color: "var(--ink)",
      fontFamily: "var(--font-sans)",
      padding: "2rem",
      textAlign: "center"
    }}>
      <div style={{ marginBottom: "2rem" }}>
        <BrandLogo />
      </div>
      
      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⚠️</div>
      
      <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem", letterSpacing: "-0.02em" }}>
        Something went wrong!
      </h1>
      
      <p style={{ color: "var(--muted)", maxWidth: "400px", marginBottom: "2rem", lineHeight: 1.6 }}>
        An unexpected error occurred in the application. Our ducks have been notified and are looking into it.
      </p>
      
      <div style={{ display: "flex", gap: "1rem" }}>
        <button 
          onClick={() => reset()} 
          className="inline-flex min-h-10 items-center justify-center rounded-md border-0 bg-[#123f36] px-4 py-2 text-[13px] font-semibold text-[#f7f5ed] no-underline disabled:cursor-wait disabled:opacity-65" 
          style={{ padding: "0.8rem 1.5rem", border: "none", cursor: "pointer", fontSize: "1rem" }}
        >
          Try again
        </button>
        <Link 
          href="/" 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            justifyContent: "center", 
            padding: "0.8rem 1.5rem",
            textDecoration: "none",
            color: "var(--ink)",
            background: "transparent",
            border: "1px solid var(--line)",
            borderRadius: "8px",
            fontWeight: 600
          }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
