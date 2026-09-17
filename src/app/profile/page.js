"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Sidebar from "../components/Sidebar";
import AppHeader from "../components/AppHeader";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const user = session?.user || {};
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [image, setImage] = useState(user.image || "");
  const [description, setDescription] = useState("");
  const [imageError, setImageError] = useState(false);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!session?.user) return;

    setName(session.user.name || "");
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
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image }),
      });

      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error || "Unable to save your profile.");
        return;
      }

      await update({ name: result.user.name, image: result.user.image ?? null });
      setImage(result.user.image || "");
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
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@example.com" />
          </label>
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
