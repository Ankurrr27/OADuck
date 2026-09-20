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
    <div className="flex min-h-screen items-center justify-center bg-[#f5f4ef] p-8">
      <div className="w-full max-w-[440px] rounded-2xl border border-[#dfe1da] bg-white px-8 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-[#17221e]">Set up your password</h1>
        <p className="mt-2 text-sm leading-6 text-[#6f7771]">
          Please set a password for your account so you can log in directly in the future.
        </p>

        <form className="mt-7 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-1.5 text-xs font-semibold text-[#505a53]">
            Password
            <input
              type="password"
              className="min-h-10 w-full rounded-md border border-[#d7dad3] bg-[#fffefa] px-3 text-[13px] outline-none focus:border-[#7c9b8d] focus:ring-3 focus:ring-[#123f36]/10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              minLength={8}
            />
          </label>
          <label className="grid gap-1.5 text-xs font-semibold text-[#505a53]">
            Confirm Password
            <input
              type="password"
              className="min-h-10 w-full rounded-md border border-[#d7dad3] bg-[#fffefa] px-3 text-[13px] outline-none focus:border-[#7c9b8d] focus:ring-3 focus:ring-[#123f36]/10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
              minLength={8}
            />
          </label>
          
          <button
            type="submit"
            className="inline-flex min-h-10 items-center justify-center rounded-md border-0 bg-[#123f36] px-4 py-2 text-[13px] font-semibold text-[#f7f5ed] disabled:opacity-65"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save password"}
          </button>
          
          {message && (
            <p className="text-sm text-[#6f7771]" role="alert">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
