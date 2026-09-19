"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function SetPasswordModal() {
  const { data: session, update } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If user is logged in and does not have a password set
    if (session?.user && session.user.hasPassword === false) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [session]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setMessage("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setMessage("Password saved successfully!");
        setTimeout(() => {
          setIsOpen(false);
          // Reloading updates the session state gracefully
          window.location.reload();
        }, 1500);
      } else {
        const data = await res.json();
        setMessage(data.message || "Failed to set password");
      }
    } catch (error) {
      setMessage("An error occurred");
    }
    setIsLoading(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "1rem" }}>
      <div style={{ backgroundColor: "var(--color-surface, #ffffff)", color: "var(--color-text, #000)", padding: "1.5rem", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", maxWidth: "400px", width: "100%", border: "1px solid var(--color-border, #ddd)" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", margin: "0 0 0.5rem 0" }}>Set a Password</h2>
        <p style={{ fontSize: "0.875rem", margin: "0 0 1.5rem 0", opacity: 0.8 }}>
          You logged in with Google. Please set a password so you can access your account even without Google login.
        </p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.875rem", fontWeight: "500" }}>
            New Password
            <input 
              type="password" 
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--color-border, #ccc)", backgroundColor: "transparent", color: "inherit" }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.875rem", fontWeight: "500" }}>
            Confirm Password
            <input 
              type="password" 
              required
              minLength={8}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--color-border, #ccc)", backgroundColor: "transparent", color: "inherit" }}
            />
          </label>
          {message && <p style={{ fontSize: "0.875rem", color: "var(--color-error, #d32f2f)", margin: 0 }}>{message}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", border: "none", background: "transparent", cursor: "pointer", color: "inherit", opacity: 0.8 }}
            >
              Skip for now
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", border: "none", borderRadius: "6px", background: "var(--color-primary, #000)", color: "var(--color-surface, #fff)", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? "Saving..." : "Set Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
