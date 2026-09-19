"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AppHeader from "../../components/AppHeader";
import Sidebar from "../../components/Sidebar";
import EditProfile from "../EditProfile";

export default function PublicProfilePage() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(`/api/user/public-profile?username=${encodeURIComponent(username)}`);
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "User not found.");
          return;
        }
        setUser(data.user);
      } catch {
        setError("Could not load profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [username]);

  if (status === "loading" || loading) {
    return (
      <main className="inner-page-shell">
        <AppHeader />
        <div className="dashboard-layout inner-page-layout">
          <Sidebar />
          <section className="inner-page-content profile-page-content">
            <p className="eyebrow">Profile</p>
            <h1>Loading...</h1>
          </section>
        </div>
      </main>
    );
  }

  const displayUsername = session?.user?.username || session?.user?.email?.split('@')[0];
  const isOwnProfile = displayUsername?.toLowerCase() === username?.toLowerCase();

  if (isOwnProfile) {
    return <EditProfile />;
  }

  if (error || !user) {
    return (
      <main className="inner-page-shell">
        <AppHeader />
        <div className="dashboard-layout inner-page-layout">
          <Sidebar />
          <section className="inner-page-content profile-page-content">
            <p className="eyebrow">Profile</p>
            <h1>User not found</h1>
            <p className="inner-page-lede">{error || "This user doesn't exist."}</p>
            <Link href="/" className="inner-page-button" style={{ display: "inline-block", marginTop: "1.5rem", textDecoration: "none" }}>Go home</Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="inner-page-shell">
      <AppHeader />
      <div className="dashboard-layout inner-page-layout">
        <Sidebar />
        <section className="inner-page-content profile-page-content">
          <p className="eyebrow">Profile</p>
          <div className="public-profile-card">
            <div className="public-profile-header">
              {user.image && !imageError ? (
                <img
                  className="public-profile-avatar"
                  src={user.image}
                  alt={user.name || user.username}
                  onError={() => setImageError(true)}
                />
              ) : (
                <span className="public-profile-avatar-fallback">
                  {(user.name || user.username || "U")[0].toUpperCase()}
                </span>
              )}
              <div>
                <h1 className="public-profile-name">{user.name || user.username}</h1>
                <p className="public-profile-username">@{user.username}</p>
                {user.role === "ADMIN" && <span className="public-profile-badge">Admin</span>}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
