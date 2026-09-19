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

    setName(session.user.name || "");
    setUsername(session.user.username || "");
    setEmail(session.user.email || "");
    setImage(session.user.image || "");
    setImageError(false);
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
      const payload = { name, image, username };
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
        <section className="w-full max-w-[1200px] flex-1 mx-auto px-[clamp(24px,4vw,56px)] py-19">
        <p className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-[#a07725]">Profile</p>
        <h1>Edit your profile</h1>
        {user.username && <p className="-mt-1 mb-1 text-[1.05rem] text-[#6f7771]">@{user.username}</p>}
        <p className="mt-4 text-sm text-[#6f7771]">Keep your practice identity up to date.</p>
        <form className="mt-11 grid max-w-[560px] gap-[18px] [&_label]:grid [&_label]:gap-1.5 [&_label]:text-xs [&_label]:font-semibold [&_label]:text-[#505a53] [&_input]:min-h-10 [&_input]:w-full [&_input]:rounded-md [&_input]:border [&_input]:border-[#d7dad3] [&_input]:bg-[#fffefa] [&_input]:px-3 [&_textarea]:w-full [&_textarea]:rounded-md [&_textarea]:border [&_textarea]:border-[#d7dad3] [&_textarea]:bg-[#fffefa] [&_textarea]:p-3" onSubmit={handleSubmit}>
          <div className="mb-2.5 flex items-center gap-4">
            {image && !imageError ? (
              <img className="block h-[72px] w-[72px] shrink-0 rounded-full border-3 border-[#dfe8df] object-cover" src={image} alt="Profile preview" onError={() => setImageError(true)} />
            ) : (
              <span className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-full bg-[#123f36] text-2xl font-bold text-[#f7f5ed]">{(name || "U")[0].toUpperCase()}</span>
            )}
            <div>
              <strong>Profile image</strong>
              <label className="inline-flex w-fit cursor-pointer rounded-md border border-[#dfe1da] bg-[#fffefa] px-2.5 py-1.5 text-[11px] text-[#123f36]">
                Change image
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} />
              </label>
              <small>PNG, JPG, or WEBP</small>
              {image && <button className="w-fit border-0 bg-transparent p-0 text-[10px] font-semibold text-[#a35d51] underline-offset-2 hover:underline" type="button" onClick={() => { setImage(""); setImageError(false); setMessage(""); }}>Remove photo</button>}
            </div>
          </div>
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
          </label>
          <label>
            Username
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Your unique username" minLength={3} maxLength={30} />
            {username && <small className="mt-1.5 block text-[.82rem] text-[#6f7771]">Your profile: <strong>/profile/{username.toLowerCase()}</strong></small>}
          </label>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@example.com" disabled />
          </label>
          <label>
            New Password (leave blank to keep current)
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimum 8 characters" minLength={8} />
          </label>
          {password && (
            <label>
              Confirm New Password
              <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm your new password" minLength={8} />
            </label>
          )}
          <label>
            Description
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Tell learners a little about yourself" rows={4} maxLength={180} />
          </label>
          <button className="inline-flex min-h-10 items-center justify-center rounded-md border-0 bg-[#123f36] px-4 py-2 text-[13px] font-semibold text-[#f7f5ed] no-underline disabled:cursor-wait disabled:opacity-65" type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"}</button>
          {message && <p className="m-0 text-xs text-[#568b62]" role="status">{message}</p>}
        </form>
        </section>
      </div>
    </main>
  );
}
