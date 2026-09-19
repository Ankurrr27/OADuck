"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import BrandLogo from "./BrandLogo";

export default function AuthForm({ initialMode = "login" }) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegistering = initialMode === "register";

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      if (isRegistering) {
        if (password !== formData.get("confirmPassword")) {
          setMessage("Passwords do not match.");
          return;
        }

        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.get("name"),
            username: formData.get("username"),
            email,
            password,
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          setMessage(result.error || "Unable to create your account.");
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result?.ok) {
        setMessage("Invalid email or password.");
        return;
      }

      window.location.assign("/");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoogle() {
    signIn("google", { callbackUrl: "/" });
  }

  return (
    <main className="auth-shell">
      <section className="welcome-panel">
        <BrandLogo dark />
        <div className="welcome-copy">
          
          <h1>Build better answers, one question at a time.</h1>
          <p className="welcome-description">A focused workspace for questions, hints, and progress.</p>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <div className="mobile-brand"><BrandLogo /></div>
          <div className="auth-heading">
           
            <h2>{isRegistering ? "Start your practice" : "Welcome back"}</h2>
            <p>{isRegistering ? "Create an account and make your next session count." : "Pick up where your practice left off."}</p>
          </div>
          
          <button className="google-button" type="button" onClick={handleGoogle}><span className="google-icon" aria-hidden="true">G</span>{isRegistering ? "Sign up with Google" : "Continue with Google"}</button>
          <div className="divider"><span>or continue with email</span></div>
          <form onSubmit={handleSubmit}>
            {isRegistering && <div className="field-row"><label>Full name<input name="name" type="text" placeholder="Alex Morgan" required /></label><label>Username<input name="username" type="text" placeholder="alexm" required /></label></div>}
            <label>Email address<input name="email" type="email" placeholder="you@example.com" required /></label>
            <label>Password<input name="password" type="password" placeholder="At least 8 characters" minLength={8} required /></label>
            {isRegistering && <label>Confirm password<input name="confirmPassword" type="password" placeholder="Repeat your password" minLength={8} required /></label>}
            {!isRegistering && <div className="form-options"><label className="checkbox-label"><input type="checkbox" name="remember" />Remember me</label><button type="button" className="text-button">Forgot password?</button></div>}
            <button className="submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Working..." : isRegistering ? "Create account" : "Log in"}<span aria-hidden="true">&#8594;</span></button>
          </form>
          {message && <p className="form-message" role="status">{message}</p>}
          <p className="auth-switch">
            {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link href={isRegistering ? "/login" : "/register"}>
              {isRegistering ? "Log in" : "Register"}
            </Link>
          </p>
        
        </div>
      </section>
    </main>
  );
}
