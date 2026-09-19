"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function SetupPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { update } = useSession();

  async function handleSubmit(event) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/user/setup-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error || "Unable to save password.");
        return;
      }

      // Update the session so it knows needsPasswordSetup is false
      await update({ needsPasswordSetup: false });
      router.push("/practice");
    } catch {
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="setup-password-shell">
      <div className="setup-password-card">
        <h1 className="auth-title">Set up your password</h1>
        <p className="auth-subtitle">
          Please set a password for your account so you can log in directly in the future.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            Password
            <input
              type="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              minLength={8}
            />
          </label>
          <label className="auth-label">
            Confirm Password
            <input
              type="password"
              className="auth-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
              minLength={8}
            />
          </label>
          
          <button
            type="submit"
            className="auth-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save password"}
          </button>
          
          {message && (
            <p className="auth-message" role="alert">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
