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
    <main className="inner-page-shell">
      <AppHeader />
      <div className="dashboard-layout inner-page-layout">
        <Sidebar />
        <section className="inner-page-content profile-page-content">
        <p className="eyebrow">Profile</p>
        <h1>Edit your profile</h1>
        {user.username && <p className="profile-username-display">@{user.username}</p>}
        <p className="inner-page-lede">Keep your practice identity up to date.</p>
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-image-editor">
            {image && !imageError ? (
              <img className="profile-image-preview" src={image} alt="Profile preview" onError={() => setImageError(true)} />
            ) : (
              <span className="profile-image-fallback">{(name || "U")[0].toUpperCase()}</span>
            )}
            <div>
              <strong>Profile image</strong>
              <label className="image-upload-button">
                Change image
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} />
              </label>
              <small>PNG, JPG, or WEBP</small>
              {image && <button className="image-remove-button" type="button" onClick={() => { setImage(""); setImageError(false); setMessage(""); }}>Remove photo</button>}
            </div>
          </div>
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
          </label>
          <label>
            Username
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Your unique username" minLength={3} maxLength={30} />
            {username && <small className="profile-url-hint">Your profile: <strong>/profile/{username.toLowerCase()}</strong></small>}
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
          <button className="inner-page-button" type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"}</button>
          {message && <p className="save-message" role="status">{message}</p>}
        </form>
        </section>
      </div>
    </main>
  );
}
