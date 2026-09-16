"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  const [mode, setMode] = useState("register");
  const [message, setMessage] = useState("");
  const [isGuest, setIsGuest] = useState(true);

  const isRegistering = mode === "register";

  if (status === "authenticated") {
    return <Dashboard user={session.user} />;
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setMessage("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage(
      isRegistering
        ? "Your account details are ready. Connect the signup API to finish registration."
        : "Your login details are ready. Connect the auth API to continue."
    );
  }

  function handleGoogle() {
    signIn("google", { callbackUrl: "/" });
  }

  if (isGuest) {
    return (
      <main className="guest-home">
        <header className="guest-header">
          <div className="brand-mark">
            <span className="brand-icon">O</span>
            <span>OA Duck</span>
          </div>
          <button className="guest-login-button" type="button" onClick={() => setIsGuest(false)}>
            Login or register
          </button>
        </header>
        <section className="guest-content">
          <p className="eyebrow">Guest mode</p>
          <h1>Welcome to your practice space.</h1>
          <p>
            Explore OA Duck and start working through questions. Create an
            account later when you want to save your progress.
          </p>
          <div className="guest-actions">
            <button className="submit-button" type="button">Explore questions <span aria-hidden="true">&#8594;</span></button>
            <span className="guest-note">No account required</span>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-shell">
      <section className="welcome-panel">
        <div className="brand-mark" aria-label="OA Duck home">
          <span className="brand-icon">O</span>
          <span>OA Duck</span>
        </div>
        <div className="welcome-copy">
          <p className="eyebrow">A calmer way to practice</p>
          <h1>Build better answers, one question at a time.</h1>
          <p className="welcome-description">
            Keep your problem-solving streak moving with a focused workspace for
            questions, hints, and thoughtful progress.
          </p>
        </div>
        <div className="welcome-footer">
          <span className="footer-line" />
          <span>Learn clearly. Practice often.</span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="mobile-brand brand-mark">
            <span className="brand-icon">O</span>
            <span>OA Duck</span>
          </div>
          <div className="auth-heading">
            <p className="eyebrow">Welcome to OA Duck</p>
            <h2>{isRegistering ? "Start your practice" : "Welcome back"}</h2>
            <p>
              {isRegistering
                ? "Create an account and make your next session count."
                : "Pick up where your practice left off."}
            </p>
          </div>

          <div className="mode-switch" role="tablist" aria-label="Authentication mode">
            <button
              className={isRegistering ? "active" : ""}
              onClick={() => changeMode("register")}
              role="tab"
              aria-selected={isRegistering}
              type="button"
            >
              Register
            </button>
            <button
              className={!isRegistering ? "active" : ""}
              onClick={() => changeMode("login")}
              role="tab"
              aria-selected={!isRegistering}
              type="button"
            >
              Login
            </button>
          </div>

          <button className="google-button" type="button" onClick={handleGoogle}>
            <span className="google-icon" aria-hidden="true">G</span>
            {isRegistering ? "Sign up with Google" : "Continue with Google"}
          </button>

          <div className="divider"><span>or continue with email</span></div>

          <form onSubmit={handleSubmit}>
            {isRegistering && (
              <div className="field-row">
                <label>
                  Full name
                  <input name="name" type="text" placeholder="Alex Morgan" required />
                </label>
                <label>
                  Username
                  <input name="username" type="text" placeholder="alexm" required />
                </label>
              </div>
            )}
            <label>
              Email address
              <input name="email" type="email" placeholder="you@example.com" required />
            </label>
            <label>
              Password
              <input name="password" type="password" placeholder="At least 8 characters" minLength={8} required />
            </label>
            {isRegistering && (
              <label>
                Confirm password
                <input name="confirmPassword" type="password" placeholder="Repeat your password" minLength={8} required />
              </label>
            )}
            {!isRegistering && (
              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" name="remember" />
                  Remember me
                </label>
                <button type="button" className="text-button">Forgot password?</button>
              </div>
            )}
            <button className="submit-button" type="submit">
              {isRegistering ? "Create account" : "Log in"}
              <span aria-hidden="true">&#8594;</span>
            </button>
          </form>

          {message && <p className="form-message" role="status">{message}</p>}

          <p className="terms-copy">
            By continuing, you agree to our <button type="button" className="text-button">Terms</button> and <button type="button" className="text-button">Privacy Policy</button>.
          </p>
          <button className="guest-button" type="button" onClick={() => setIsGuest(true)}>
            Continue as guest
          </button>
        </div>
        <p className="copyright">© 2026 OA Duck</p>
      </section>
    </main>
  );
}

function Dashboard({ user }) {
  const username = user.email?.split("@")[0] || "learner";
  const firstName = user.name?.split(" ")[0] || "there";

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div className="brand-mark dashboard-brand">
          <span className="brand-icon">O</span>
          <span>OA Duck</span>
        </div>
        <div className="profile-menu">
          {user.image ? (
            <img className="profile-avatar" src={user.image} alt={`${user.name || "User"} profile`} />
          ) : (
            <span className="profile-avatar profile-fallback">{(user.name || "U")[0]}</span>
          )}
          <div className="profile-details">
            <strong>{user.name || "OA Duck learner"}</strong>
            <span>@{username}</span>
          </div>
          <button className="signout-button" type="button" onClick={() => signOut({ callbackUrl: "/" })}>
            Sign out
          </button>
        </div>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-intro">
          <div>
            <p className="eyebrow">Your workspace</p>
            <h1>Good to see you, {firstName}.</h1>
            <p>Choose a practice path and keep your problem-solving momentum going.</p>
          </div>
          <div className="account-chip">
            <span className="status-dot" />
            <span>{user.email}</span>
          </div>
        </div>

        <div className="dashboard-grid">
          <button className="dashboard-card dashboard-card-primary" type="button">
            <span className="card-kicker">Start here</span>
            <strong>Practice a question</strong>
            <span>Work through a fresh problem at your pace.</span>
            <span className="card-arrow" aria-hidden="true">&#8594;</span>
          </button>
          <button className="dashboard-card" type="button">
            <span className="card-kicker">Browse</span>
            <strong>Question library</strong>
            <span>Explore curated questions and build a routine.</span>
            <span className="card-arrow" aria-hidden="true">&#8594;</span>
          </button>
          <div className="progress-card">
            <span className="card-kicker">Your progress</span>
            <strong>Ready when you are</strong>
            <span>Complete your first session to see your stats here.</span>
            <div className="progress-bar"><span /></div>
          </div>
        </div>
      </section>
    </main>
  );
}
