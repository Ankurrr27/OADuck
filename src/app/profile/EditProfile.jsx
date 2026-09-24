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
      <div className="flex min-h-[calc(100dvh-3.5rem)]">
        <Sidebar />
        <section className="mx-auto w-full max-w-[1120px] flex-1 px-[clamp(20px,3vw,40px)] py-6">
          <header className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-[#dfe1da] pb-3">
            <div><h1 className="m-0 text-2xl font-semibold tracking-[-.04em] text-[#123f36]">Profile settings</h1><p className="m-0 mt-1 text-xs text-[#6f7771]">Update your public details and account password.</p></div>
            <span className="text-xs font-semibold text-[#526057]">@{username || "your-handle"}</span>
          </header>
          <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]" onSubmit={handleSubmit}>
            <section className="min-w-0 rounded-lg border border-[#dfe1da] bg-[#fffefa] p-4">
              <div className="mb-3 flex items-center gap-3 border-b border-[#e8ebe5] pb-3">
                {image && !imageError ? <img className="h-11 w-11 shrink-0 rounded-full border border-[#dfe1da] object-cover" src={image} alt="Profile preview" onError={() => setImageError(true)} /> : <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#123f36] text-base font-bold text-[#f7f5ed]">{(name || "U")[0].toUpperCase()}</span>}
                <div><h2 className="m-0 text-sm font-semibold">Personal details</h2><p className="m-0 mt-0.5 text-xs text-[#6f7771]">Shown on your public profile.</p></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 [&_label]:grid [&_label]:gap-1 [&_label]:text-xs [&_label]:font-semibold [&_label]:text-[#505a53] [&_input]:min-h-9 [&_input]:w-full [&_input]:rounded-md [&_input]:border [&_input]:border-[#d7dad3] [&_input]:bg-white [&_input]:px-2.5 [&_input]:text-[13px] [&_input]:outline-none [&_input]:focus:border-[#176a5a] [&_input]:focus:ring-2 [&_input]:focus:ring-[#176a5a]/10 [&_textarea]:w-full [&_textarea]:resize-y [&_textarea]:rounded-md [&_textarea]:border [&_textarea]:border-[#d7dad3] [&_textarea]:bg-white [&_textarea]:px-2.5 [&_textarea]:py-2 [&_textarea]:text-[13px] [&_textarea]:outline-none [&_textarea]:focus:border-[#176a5a] [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-[#176a5a]/10">
                <label>Name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label>
                <label>Username<input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="your-handle" minLength={3} maxLength={30} /></label>
                <label className="sm:col-span-2">Email<input value={email} type="email" placeholder="you@example.com" disabled className="cursor-not-allowed bg-[#f3f4ef]! text-[#879088]" /></label>
                <label className="sm:col-span-2">About you<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="A short introduction (optional)" rows={3} maxLength={180} /><span className="text-right text-[11px] font-medium text-[#879088]">{description.length}/180</span></label>
              </div>
            </section>

            <div className="grid content-start gap-4">
              <section className="rounded-lg border border-[#dfe1da] bg-[#fffefa] p-4">
                <h2 className="m-0 text-sm font-semibold">Profile photo</h2>
                <label className="mt-3 flex min-h-9 cursor-pointer items-center justify-center rounded-md border border-[#d8e2d9] px-3 text-xs font-semibold text-[#315b48] transition hover:bg-[#f5f8f3]">{image ? "Change photo" : "Upload photo"}<input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} /></label>
                <p className="mb-0 mt-1.5 text-center text-[11px] text-[#879088]">PNG, JPG or WEBP · 5 MB max</p>
                {image && <button className="mt-2 w-full rounded-md border border-[#efd7d1] bg-[#fff8f6] px-3 py-1.5 text-xs font-semibold text-[#9b4032]" type="button" onClick={() => { setImage(""); setImageError(false); setMessage(""); }}>Remove photo</button>}
                <p className="mb-0 mt-3 border-t border-[#e8ebe5] pt-3 text-[11px] font-semibold text-[#7b867e]">Public profile</p>
                <p className="mb-0 mt-1 break-all text-xs text-[#506058]">/profile/{username ? username.toLowerCase() : "your-handle"}</p>
              </section>
              <section className="rounded-lg border border-[#dfe1da] bg-[#fffefa] p-4">
                <h2 className="m-0 text-sm font-semibold">Change password</h2><p className="mb-0 mt-1 text-xs text-[#6f7771]">Leave blank to keep your current password.</p>
                <div className="mt-3 grid gap-3 [&_label]:grid [&_label]:gap-1 [&_label]:text-xs [&_label]:font-semibold [&_label]:text-[#505a53] [&_input]:min-h-9 [&_input]:w-full [&_input]:rounded-md [&_input]:border [&_input]:border-[#d7dad3] [&_input]:bg-white [&_input]:px-2.5 [&_input]:text-[13px] [&_input]:outline-none [&_input]:focus:border-[#176a5a] [&_input]:focus:ring-2 [&_input]:focus:ring-[#176a5a]/10"><label>New password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimum 8 characters" minLength={8} /></label>{password && <label>Confirm password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat password" minLength={8} /></label>}</div>
              </section>
            </div>
            <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-[#dfe1da] pt-3 lg:col-span-2">
              {message && <p className={`mr-auto m-0 text-xs font-medium ${message === "Profile updated." ? "text-[#568b62]" : "text-[#a3453a]"}`} role="status">{message}</p>}
              <button className="inline-flex min-h-9 items-center justify-center rounded-md border border-[#123f36] bg-[#123f36] px-4 text-xs font-semibold text-white transition hover:bg-[#176a5a] disabled:cursor-wait disabled:opacity-65" type="submit" disabled={isSaving}>{isSaving ? "Saving…" : "Save changes"}</button>
            </footer>
          </form>
        </section>
      </div>
    </main>
  );
}
