"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Sidebar from "../components/Sidebar";
import AppHeader from "../components/AppHeader";

export default function EditProfile() {
  const { data: session, update } = useSession();
  const user = session?.user || {};
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [username, setUsername] = useState(user.username || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [image, setImage] = useState(user.image || "");
  const [description, setDescription] = useState("");
  const [imageError, setImageError] = useState(false);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!session?.user) return;

    async function loadProfile() {
      try {
        const response = await fetch("/api/profile");
        const result = await response.json();
        if (!response.ok || !result.user) return;

        setName(result.user.name || "");
        setEmail(result.user.email || "");
        setUsername(result.user.username || "");
        setImage(result.user.image || "");
        setDescription(result.user.description || "");
        setImageError(false);
      } catch {
        // The session data remains a usable fallback if the profile request fails.
      }
    }

    loadProfile();
  }, [session]);

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Profile images must be 5 MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      setImageError(false);
      setMessage("");
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (password && password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const payload = { name, image, username, description };
      if (password) {
        payload.password = password;
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error || "Unable to save your profile.");
        return;
      }

      await update({ name: result.user.name, image: result.user.image ?? null, username: result.user.username });
      setImage(result.user.image || "");
      setUsername(result.user.username || "");
      setDescription(result.user.description || "");
      setPassword("");
      setConfirmPassword("");
      setImageError(false);
      setMessage("Profile updated.");
    } catch {
      setMessage("Unable to save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f4ef] text-[#17221e]">
      <AppHeader />
      <div className="flex min-h-[calc(100vh-60px)] ">
        <Sidebar />
        <section className="w-full max-w-[1280px] flex-1 mx-auto px-[clamp(24px,4vw,56px)] py-12 md:py-16">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-[#a07725]">Your space</p>
          <div className="page-hero relative overflow-hidden rounded-2xl bg-[#123f36] px-6 py-7 text-[#f7f5ed] shadow-[0_18px_40px_rgba(18,63,54,.16)] sm:px-9 sm:py-8">
            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border-[28px] border-[#f5c75d]/15" aria-hidden="true" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[#f5c75d]">Profile settings</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">Make it unmistakably yours.</h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#d3e0d8]">Your profile travels with your practice — update how you appear to the OA Duck community.</p>
              </div>
              <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-[#eaf1eb]">@{username || "your-handle"}</div>
            </div>
          </div>

          <form className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_320px]" onSubmit={handleSubmit}>
            <div className="grid gap-7">
              <section className="rounded-2xl border border-[#dfe1da] bg-[#fffefa] p-5 shadow-sm sm:p-7">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div><h2 className="text-lg font-semibold tracking-[-.025em]">Identity</h2><p className="mt-1 text-sm text-[#6f7771]">The details people see when they visit your profile.</p></div>
                  {image && !imageError ? <img className="h-16 w-16 shrink-0 rounded-full border-3 border-[#dfe8df] object-cover" src={image} alt="Profile preview" onError={() => setImageError(true)} /> : <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#123f36] text-xl font-bold text-[#f7f5ed]">{(name || "U")[0].toUpperCase()}</span>}
                </div>
                <div className="grid gap-5 [&_label]:grid [&_label]:gap-1.5 [&_label]:text-xs [&_label]:font-semibold [&_label]:text-[#505a53] [&_input]:min-h-11 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-[#d7dad3] [&_input]:bg-[#fffefa] [&_input]:px-3 [&_input]:text-sm [&_input]:outline-none [&_input]:focus:border-[#176a5a] [&_input]:focus:ring-3 [&_input]:focus:ring-[#176a5a]/10 [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-[#d7dad3] [&_textarea]:bg-[#fffefa] [&_textarea]:p-3 [&_textarea]:text-sm [&_textarea]:outline-none [&_textarea]:focus:border-[#176a5a] [&_textarea]:focus:ring-3 [&_textarea]:focus:ring-[#176a5a]/10">
                  <div className="grid gap-5 sm:grid-cols-2"><label>Name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label><label>Username<input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="your-handle" minLength={3} maxLength={30} /></label></div>
                  <label>Email<input value={email} type="email" placeholder="you@example.com" disabled className="cursor-not-allowed bg-[#f3f4ef]! text-[#879088]" /></label>
                  <label>About you<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Tell learners a little about yourself" rows={4} maxLength={180} /><span className="text-right text-[11px] font-medium text-[#879088]">{description.length}/180</span></label>
                </div>
              </section>

              <section className="rounded-2xl border border-[#dfe1da] bg-[#fffefa] p-5 shadow-sm sm:p-7">
                <h2 className="text-lg font-semibold tracking-[-.025em]">Security</h2><p className="mt-1 text-sm text-[#6f7771]">Leave these blank unless you want to set a new password.</p>
                <div className="mt-6 grid gap-5 sm:grid-cols-2 [&_label]:grid [&_label]:gap-1.5 [&_label]:text-xs [&_label]:font-semibold [&_label]:text-[#505a53] [&_input]:min-h-11 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-[#d7dad3] [&_input]:bg-[#fffefa] [&_input]:px-3 [&_input]:text-sm [&_input]:outline-none [&_input]:focus:border-[#176a5a] [&_input]:focus:ring-3 [&_input]:focus:ring-[#176a5a]/10"><label>New password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimum 8 characters" minLength={8} /></label>{password && <label>Confirm password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat new password" minLength={8} /></label>}</div>
              </section>
            </div>

            <aside className="h-fit rounded-2xl border border-[#dfe1da] bg-[#fffefa] p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold tracking-[-.025em]">Profile photo</h2><p className="mt-1 text-sm leading-6 text-[#6f7771]">Use a clear photo so your teammates can spot you quickly.</p>
              <label className="mt-5 flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#8eaa9d] bg-[#eef5f0] px-3 text-xs font-bold text-[#123f36] transition hover:bg-[#e1eee6]">Upload a photo<input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} /></label>
              <p className="mt-2 text-center text-[11px] text-[#879088]">PNG, JPG, or WEBP · 5 MB max</p>
              {image && <button className="mt-4 w-full rounded-lg border border-[#efd7d1] bg-[#fff8f6] px-3 py-2 text-xs font-semibold text-[#9b4032] transition hover:bg-[#fbece8]" type="button" onClick={() => { setImage(""); setImageError(false); setMessage(""); }}>Remove photo</button>}
              <div className="my-6 border-t border-[#e8ebe5]" />
              <p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#a07725]">Public link</p><p className="mt-2 break-all rounded-lg bg-[#f4f5f1] px-3 py-2 text-xs text-[#506058]">/profile/{username ? username.toLowerCase() : "your-handle"}</p>
              <button className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg border-0 bg-[#123f36] px-4 py-2 text-sm font-semibold text-[#f7f5ed] transition hover:bg-[#176a5a] disabled:cursor-wait disabled:opacity-65" type="submit" disabled={isSaving}>{isSaving ? "Saving changes…" : "Save changes"}</button>
              {message && <p className="mt-3 text-center text-xs font-medium text-[#568b62]" role="status">{message}</p>}
            </aside>
          </form>
        </section>
      </div>
    </main>
  );
}
