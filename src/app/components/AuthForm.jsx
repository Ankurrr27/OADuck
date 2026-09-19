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
    <main className="grid min-h-screen bg-[#f5f4ef] lg:grid-cols-[minmax(360px,.9fr)_minmax(520px,1.1fr)]">
      <section className="hidden min-h-screen flex-col bg-[#123f36] px-[clamp(32px,6vw,92px)] pt-10 text-[#f7f5ed] lg:flex">
        <BrandLogo dark />
        <div className="mt-[clamp(150px,22vh,220px)] max-w-[490px]">
          
          <h1 className="max-w-[470px] text-[clamp(38px,4.7vw,67px)] font-medium tracking-[-.055em] leading-[.99]">Build better answers, one question at a time.</h1>
          <p className="mt-7 max-w-[370px] text-[15px] leading-7 text-[#bdcbc3]">A focused workspace for questions, hints, and progress.</p>
        </div>
      </section>
      <section className="flex min-h-screen flex-col items-center justify-center px-6 py-9 lg:px-8">
        <div className="w-full max-w-[445px]">
          <div className="mb-7 flex lg:hidden"><BrandLogo /></div>
          <div>
           
            <h2 className="text-[32px] font-medium tracking-[-.05em] leading-[1.05] text-[#17221e]">{isRegistering ? "Start your practice" : "Welcome back"}</h2>
            <p className="mt-2 text-sm leading-5 text-[#6f7771]">{isRegistering ? "Create an account and make your next session count." : "Pick up where your practice left off."}</p>
          </div>
          
          <button className="mt-5 flex min-h-10 w-full items-center justify-center gap-2.5 rounded-lg border border-[#cfd3cb] bg-[#fffefa] text-[13px] font-semibold text-[#17221e]" type="button" onClick={handleGoogle}><span className="text-xl font-extrabold text-[#4285f4]" aria-hidden="true">G</span>{isRegistering ? "Sign up with Google" : "Continue with Google"}</button>
          <div className="my-3 flex items-center gap-3 text-[11px] text-[#9a9f99] before:h-px before:flex-1 before:bg-[#dfe1da] after:h-px after:flex-1 after:bg-[#dfe1da]"><span>or continue with email</span></div>
          <form className="grid gap-2.5" onSubmit={handleSubmit}>
            {isRegistering && <div className="grid gap-2.5 sm:grid-cols-2"><label className="grid gap-1.5 text-xs font-semibold text-[#505a53]">Full name<input className="min-h-9.5 w-full rounded-md border border-[#d7dad3] bg-[#fffefa] px-3 text-[13px] outline-none focus:border-[#7c9b8d]" name="name" type="text" placeholder="Alex Morgan" required /></label><label className="grid gap-1.5 text-xs font-semibold text-[#505a53]">Username<input className="min-h-9.5 w-full rounded-md border border-[#d7dad3] bg-[#fffefa] px-3 text-[13px] outline-none focus:border-[#7c9b8d]" name="username" type="text" placeholder="alexm" required /></label></div>}
            <label className="grid gap-1.5 text-xs font-semibold text-[#505a53]">Email address<input className="min-h-9.5 w-full rounded-md border border-[#d7dad3] bg-[#fffefa] px-3 text-[13px] outline-none focus:border-[#7c9b8d]" name="email" type="email" placeholder="you@example.com" required /></label>
            <label className="grid gap-1.5 text-xs font-semibold text-[#505a53]">Password<input className="min-h-9.5 w-full rounded-md border border-[#d7dad3] bg-[#fffefa] px-3 text-[13px] outline-none focus:border-[#7c9b8d]" name="password" type="password" placeholder="At least 8 characters" minLength={8} required /></label>
            {isRegistering && <label className="grid gap-1.5 text-xs font-semibold text-[#505a53]">Confirm password<input className="min-h-9.5 w-full rounded-md border border-[#d7dad3] bg-[#fffefa] px-3 text-[13px] outline-none focus:border-[#7c9b8d]" name="confirmPassword" type="password" placeholder="Repeat your password" minLength={8} required /></label>}
            {!isRegistering && <div className="flex items-center justify-between text-[11px] text-[#6f7771]"><label className="flex items-center gap-2"><input className="accent-[#123f36]" type="checkbox" name="remember" />Remember me</label><button type="button" className="bg-transparent text-[#6f5926] underline">Forgot password?</button></div>}
            <button className="mt-0.5 flex min-h-10 w-full items-center justify-center gap-2.5 rounded-lg border border-[#123f36] bg-[#123f36] text-[13px] font-semibold text-[#fffdf5] disabled:cursor-wait disabled:opacity-65" type="submit" disabled={isSubmitting}>{isSubmitting ? "Working..." : isRegistering ? "Create account" : "Log in"}<span className="text-lg font-normal" aria-hidden="true">&#8594;</span></button>
          </form>
          {message && <p className="mt-3 border-l-3 border-[#f5c75d] bg-[#fff9e7] px-3 py-2.5 text-xs leading-5 text-[#5d624f]" role="status">{message}</p>}
          <p className="mt-[18px] text-center text-xs text-[#6f7771]">
            {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link className="font-bold text-[#123f36] underline underline-offset-3" href={isRegistering ? "/login" : "/register"}>
              {isRegistering ? "Log in" : "Register"}
            </Link>
          </p>
        
        </div>
      </section>
    </main>
  );
}
