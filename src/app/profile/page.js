"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Sidebar from "../components/Sidebar";
import AppHeader from "../components/AppHeader";

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user || {};
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [image, setImage] = useState(user.image || "");
  const [description, setDescription] = useState("");
  const [saved, setSaved] = useState(false);

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    setSaved(false);
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
        <form className="profile-form" onSubmit={(event) => { event.preventDefault(); setSaved(true); }}>
          <div className="profile-image-editor">
            {image ? (
              <img className="profile-image-preview" src={image} alt="Profile preview" />
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
          <button className="inner-page-button" type="submit">Save changes</button>
          {saved && <p className="save-message" role="status">Changes saved locally.</p>}
        </form>
        </section>
      </div>
    </main>
  );
}
