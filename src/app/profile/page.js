"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Sidebar from "../components/Sidebar";
import AppHeader from "../components/AppHeader";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const user = session?.user || {};
  
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [password, setPassword] = useState("");
  
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user.name) setName(user.name);
    if (user.username) setUsername(user.username);
    if (user.email) setEmail(user.email);
    if (user.image) setImage(user.image);
  }, [user]);

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Convert to base64 for simplicity
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setSaved(false);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");
    setSaved(false);

    try {
      const payload = { name, username, image };
      if (password) {
        payload.password = password;
      }

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setSaved(true);
        setPassword(""); // Clear password field after save
        setMessage("Profile updated successfully.");
        // Update next-auth session
        update();
      } else {
        setMessage(data.message || "Failed to update profile.");
      }
    } catch (error) {
      setMessage("An error occurred.");
    }
    setIsLoading(false);
  }

  return (
    <main className="inner-page-shell">
      <AppHeader />
      <div className="dashboard-layout inner-page-layout">
        <Sidebar />
        <section className="inner-page-content profile-page-content">
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="eyebrow">Profile</p>
              <h1>Edit your profile</h1>
              <p className="inner-page-lede">Keep your practice identity up to date.</p>
            </div>
            {username && (
              <Link href={`/profile/${username}`} className="text-sm font-medium text-blue-600 hover:underline">
                View Public Profile &rarr;
              </Link>
            )}
          </div>
          
          <form className="profile-form" onSubmit={handleSubmit}>
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
                <small>PNG, JPG, or WEBP (Saved directly to DB for now)</small>
              </div>
            </div>
            <label>
              Username
              <input value={username} onChange={(event) => { setUsername(event.target.value); setSaved(false); }} placeholder="your_username" required />
            </label>
            <label>
              Name
              <input value={name} onChange={(event) => { setName(event.target.value); setSaved(false); }} placeholder="Your name" />
            </label>
            <label>
              Email (Read-only)
              <input value={email} type="email" placeholder="you@example.com" disabled style={{ opacity: 0.7 }} />
            </label>
            <div className="divider my-4 border-t border-zinc-200 dark:border-zinc-800 pt-4">
              <h3 className="text-lg font-semibold mb-2">Change Password</h3>
              <p className="text-sm text-zinc-500 mb-4">Leave blank if you don't want to change it.</p>
            </div>
            <label>
              New Password
              <input 
                type="password" 
                value={password} 
                onChange={(event) => { setPassword(event.target.value); setSaved(false); }} 
                placeholder="New password (min 8 chars)" 
                minLength={8} 
              />
            </label>
            
            <button className="inner-page-button" type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </button>
            {saved && <p className="save-message text-green-600" role="status">{message}</p>}
            {!saved && message && <p className="save-message text-red-600" role="status">{message}</p>}
          </form>
        </section>
      </div>
    </main>
  );
}
