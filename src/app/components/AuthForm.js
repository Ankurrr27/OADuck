"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import BrandLogo from "./BrandLogo";

export default function AuthForm({ initialMode = "login" }) {
  const [message, setMessage] = useState("");
  const isRegistering = initialMode === "register";

  function handleSubmit(event) {
    event.preventDefault();
    setMessage(isRegistering ? "Your account details are ready. Connect the signup API to finish registration." : "Your login details are ready. Connect the auth API to continue.");
  }

  function handleGoogle() {
    signIn("google", { callbackUrl: "/" });
  }

  return (
    <main className="auth-shell">
      <section className="welcome-panel">
        <BrandLogo dark />
        <div className="welcome-copy">
          <p className="eyebrow">A calmer way to practice</p>
          <h1>Build better answers, one question at a time.</h1>
          <p className="welcome-description">A focused workspace for questions, hints, and progress.</p>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <div className="mobile-brand"><BrandLogo /></div>
          <div className="auth-heading">
            <p className="eyebrow">Welcome to OA Duck</p>
            <h2>{isRegistering ? "Start your practice" : "Welcome back"}</h2>
            <p>{isRegistering ? "Create an account and make your next session count." : "Pick up where your practice left off."}</p>
          </div>
          <div className="mode-switch" role="tablist" aria-label="Authentication mode">
            <Link className={isRegistering ? "active" : ""} href="/register" role="tab" aria-selected={isRegistering}>Register</Link>
            <Link className={!isRegistering ? "active" : ""} href="/login" role="tab" aria-selected={!isRegistering}>Login</Link>
          </div>
          <button className="google-button" type="button" onClick={handleGoogle}><span className="google-icon" aria-hidden="true">G</span>{isRegistering ? "Sign up with Google" : "Continue with Google"}</button>
          <div className="divider"><span>or continue with email</span></div>
          <form onSubmit={handleSubmit}>
            {isRegistering && <div className="field-row"><label>Full name<input name="name" type="text" placeholder="Alex Morgan" required /></label><label>Username<input name="username" type="text" placeholder="alexm" required /></label></div>}
            <label>Email address<input name="email" type="email" placeholder="you@example.com" required /></label>
            <label>Password<input name="password" type="password" placeholder="At least 8 characters" minLength={8} required /></label>
            {isRegistering && <label>Confirm password<input name="confirmPassword" type="password" placeholder="Repeat your password" minLength={8} required /></label>}
            {!isRegistering && <div className="form-options"><label className="checkbox-label"><input type="checkbox" name="remember" />Remember me</label><button type="button" className="text-button">Forgot password?</button></div>}
            <button className="submit-button" type="submit">{isRegistering ? "Create account" : "Log in"}<span aria-hidden="true">&#8594;</span></button>
          </form>
          {message && <p className="form-message" role="status">{message}</p>}
          <p className="terms-copy">By continuing, you agree to our <button type="button" className="text-button">Terms</button> and <button type="button" className="text-button">Privacy Policy</button>.</p>
        </div>
      </section>
    </main>
  );
}
