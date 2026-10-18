"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "../components/Sidebar";
import AppHeader from "../components/AppHeader";

export default function EditProfile({ onBack }) {
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
    <main className="min-h-screen bg-[#f3f6f4] text-slate-900">
      <AppHeader />
      <div className="flex min-h-[calc(100dvh-3.5rem)]">
        <Sidebar />
        <section className="mx-auto w-full max-w-[1120px] flex-1 px-4 py-3 sm:px-5 sm:py-5 lg:px-7">
          <header className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 sm:mb-4 sm:gap-3">
            <div><h1 className="m-0 text-lg font-semibold text-slate-900 sm:text-2xl">Profile settings</h1><p className="m-0 mt-1 text-xs text-slate-600">Update your public details and account password.</p></div>
            {onBack ? <button className="min-h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-50" type="button" onClick={onBack}>Back to profile</button> : <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-900">@{username || "your-handle"}</span>}
          </header>
          <form className="grid min-w-0 gap-2.5 lg:grid-cols-[minmax(0,1fr)_272px] sm:gap-4" onSubmit={handleSubmit}>
            <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-3 shadow-[0_2px_8px_rgba(20,55,40,.04)] sm:p-4">
              <div className="mb-3 flex items-center gap-3 border-b border-slate-100 pb-3">
                {image && !imageError ? <img className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover" src={image} alt="Profile preview" onError={() => setImageError(true)} /> : <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#103c32] text-sm font-bold text-white">{(name || "U")[0].toUpperCase()}</span>}
                <div><h2 className="m-0 text-sm font-semibold text-slate-900">Personal details</h2><p className="m-0 mt-0.5 text-xs text-slate-600">Shown on your public profile.</p></div>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 sm:gap-3 [&_label]:grid [&_label]:gap-1 [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-700 [&_input]:min-h-10 [&_input]:w-full [&_input]:min-w-0 [&_input]:rounded-md [&_input]:border [&_input]:border-slate-300 [&_input]:bg-white [&_input]:px-2.5 [&_input]:text-[13px] [&_input]:text-slate-900 [&_input]:outline-none [&_input]:transition [&_input]:focus:border-emerald-600 [&_input]:focus:ring-2 [&_input]:focus:ring-emerald-600/10 [&_textarea]:w-full [&_textarea]:resize-y [&_textarea]:rounded-md [&_textarea]:border [&_textarea]:border-slate-300 [&_textarea]:bg-white [&_textarea]:px-2.5 [&_textarea]:py-2 [&_textarea]:text-[13px] [&_textarea]:text-slate-900 [&_textarea]:outline-none [&_textarea]:transition [&_textarea]:focus:border-emerald-600 [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-emerald-600/10">
                <label>Name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label>
                <label>Username<input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="your-handle" minLength={3} maxLength={30} /></label>
                <label className="col-span-2 sm:col-span-2">Email<input value={email} type="email" placeholder="you@example.com" disabled className="cursor-not-allowed bg-slate-50! text-slate-500" /></label>
                <label className="col-span-2 sm:col-span-2">About you<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="A short introduction (optional)" rows={2} maxLength={180} /><span className="text-right text-[11px] font-medium text-slate-500">{description.length}/180</span></label>
              </div>
            </section>

            <div className="grid content-start gap-3 sm:gap-4">
              <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_2px_8px_rgba(20,55,40,.04)] sm:p-4">
                <h2 className="m-0 text-sm font-semibold text-slate-900">Profile photo</h2>
                <label className="mt-2 flex min-h-10 cursor-pointer items-center justify-center rounded-md border border-emerald-200 px-3 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-50 sm:mt-3">{image ? "Change photo" : "Upload photo"}<input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} /></label>
                <p className="mb-0 mt-1.5 text-center text-[11px] text-slate-500">PNG, JPG or WEBP · 5 MB max</p>
                {image && <button className="mt-2 w-full rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-700" type="button" onClick={() => { setImage(""); setImageError(false); setMessage(""); }}>Remove photo</button>}
                <p className="mb-0 mt-3 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-600">Public profile</p>
                <p className="mb-0 mt-1 break-all text-xs text-slate-700">/profile/{username ? username.toLowerCase() : "your-handle"}</p>
              </section>
              <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_2px_8px_rgba(20,55,40,.04)] sm:p-4">
                <h2 className="m-0 text-sm font-semibold text-slate-900">Change password</h2><p className="mb-0 mt-1 text-xs text-slate-600">Leave blank to keep your current password.</p>
                <div className="mt-2 grid gap-2.5 sm:mt-3 sm:gap-3 [&_label]:grid [&_label]:gap-1 [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-700 [&_input]:min-h-10 [&_input]:w-full [&_input]:rounded-md [&_input]:border [&_input]:border-slate-300 [&_input]:bg-white [&_input]:px-2.5 [&_input]:text-[13px] [&_input]:text-slate-900 [&_input]:outline-none [&_input]:transition [&_input]:focus:border-emerald-600 [&_input]:focus:ring-2 [&_input]:focus:ring-emerald-600/10"><label>New password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimum 8 characters" minLength={8} /></label>{password && <label>Confirm password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat password" minLength={8} /></label>}</div>
              </section>
            </div>
            <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-3 lg:col-span-2">
              {message && <p className={`mr-auto m-0 text-[11px] font-medium ${message === "Profile updated." ? "text-emerald-700" : "text-rose-700"}`} role="status">{message}</p>}
              <button className="inline-flex min-h-9 items-center justify-center rounded-md border border-[#103c32] bg-[#103c32] px-4 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-65" type="submit" disabled={isSaving}>{isSaving ? "Saving…" : "Save changes"}</button>
            </footer>
          </form>
        </section>
      </div>
    </main>
  );
}
