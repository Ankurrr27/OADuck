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
      <main className="min-h-screen bg-[#f5f4ef] text-[#17221e]">
        <AppHeader />
        <div className="flex min-h-[calc(100vh-60px)] ">
          <Sidebar />
          <section className="w-full max-w-[1200px] flex-1 mx-auto px-[clamp(24px,4vw,56px)] py-19">
            <p className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-[#a07725]">Profile</p>
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
      <main className="min-h-screen bg-[#f5f4ef] text-[#17221e]">
        <AppHeader />
        <div className="flex min-h-[calc(100vh-60px)] ">
          <Sidebar />
          <section className="w-full max-w-[1200px] flex-1 mx-auto px-[clamp(24px,4vw,56px)] py-19">
            <p className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-[#a07725]">Profile</p>
            <h1>User not found</h1>
            <p className="mt-4 text-sm text-[#6f7771]">{error || "This user doesn't exist."}</p>
            <Link href="/" className="inline-flex min-h-10 items-center justify-center rounded-md border-0 bg-[#123f36] px-4 py-2 text-[13px] font-semibold text-[#f7f5ed] no-underline disabled:cursor-wait disabled:opacity-65" style={{ display: "inline-block", marginTop: "1.5rem", textDecoration: "none" }}>Go home</Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f4ef] text-[#17221e]">
      <AppHeader />
      <div className="flex min-h-[calc(100vh-60px)] ">
        <Sidebar />
        <section className="w-full max-w-[1200px] flex-1 mx-auto px-[clamp(24px,4vw,56px)] py-19">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-[#a07725]">Profile</p>
          <div className="mt-6">
            <div className="flex items-center gap-6">
              {user.image && !imageError ? (
                <img
                  className="h-24 w-24 rounded-full border-3 border-[#dfe1da] object-cover"
                  src={user.image}
                  alt={user.name || user.username}
                  onError={() => setImageError(true)}
                />
              ) : (
                <span className="h-24 w-24 rounded-full border-3 border-[#dfe1da] object-cover-fallback">
                  {(user.name || user.username || "U")[0].toUpperCase()}
                </span>
              )}
              <div>
                <h1 className="m-0 text-[1.6rem] font-bold leading-tight">{user.name || user.username}</h1>
                <p className="mt-1 text-base text-[#6f7771]">@{user.username}</p>
                {user.role === "ADMIN" && <span className="mt-1.5 inline-block rounded-full bg-[#f5c75d] px-2.5 py-0.5 text-xs font-semibold tracking-[.03em] text-[#17221e]">Admin</span>}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
