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
        <div className="flex min-h-[calc(100dvh-3.5rem)]">
          <Sidebar />
          <section className="mx-auto w-full max-w-[1120px] flex-1 px-[clamp(20px,3vw,40px)] py-6">
            <h1 className="m-0 text-2xl font-semibold tracking-[-.04em] text-[#123f36]">Profile</h1>
            <p className="mt-2 text-sm text-[#6f7771]">Loading profile…</p>
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
        <div className="flex min-h-[calc(100dvh-3.5rem)]">
          <Sidebar />
          <section className="mx-auto w-full max-w-[1120px] flex-1 px-[clamp(20px,3vw,40px)] py-6">
            <h1 className="m-0 text-2xl font-semibold tracking-[-.04em] text-[#123f36]">User not found</h1>
            <p className="mt-2 text-sm text-[#6f7771]">{error || "This user doesn't exist."}</p>
            <Link href="/" className="mt-3 inline-flex min-h-9 items-center justify-center rounded-md bg-[#123f36] px-3 text-xs font-semibold text-[#f7f5ed] no-underline">Go home</Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f4ef] text-[#17221e]">
      <AppHeader />
      <div className="flex min-h-[calc(100dvh-3.5rem)]">
        <Sidebar />
        <section className="mx-auto w-full max-w-[1120px] flex-1 px-[clamp(20px,3vw,40px)] py-6">
          <header className="mb-4 border-b border-[#dfe1da] pb-3">
            <h1 className="m-0 text-2xl font-semibold tracking-[-.04em] text-[#123f36]">Profile</h1>
          </header>
          <article className="flex flex-col gap-3 border-b border-[#dfe1da] pb-4 sm:flex-row sm:items-start">
            {user.image && !imageError ? (
              <img
                className="h-14 w-14 shrink-0 rounded-full border border-[#dfe1da] object-cover"
                src={user.image}
                alt={user.name || user.username}
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#e8f1eb] text-lg font-semibold text-[#123f36]">
                {(user.name || user.username || "U")[0].toUpperCase()}
              </span>
            )}
            <div>
              <h2 className="m-0 text-lg font-semibold leading-tight text-[#17221e]">{user.name || user.username}</h2>
              <p className="mb-0 mt-1 text-xs text-[#6f7771]">
                @{user.username}
                {user.role === "ADMIN" && <span className="ml-2 rounded bg-[#f5c75d]/25 px-1.5 py-0.5 font-semibold text-[#7d5c17]">Admin</span>}
              </p>
              {user.description && <p className="mb-0 mt-3 max-w-2xl text-sm leading-5 text-[#526057]">{user.description}</p>}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
