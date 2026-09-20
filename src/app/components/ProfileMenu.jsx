"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function ProfileMenu() {
  const { data: session } = useSession();
  const user = session?.user || {};
  const name = user.name || "OA Duck learner";
  const username = user.email?.split("@")[0] || "learner";
  const displayUsername = user.username || username;
  const profileUrl = displayUsername ? `/profile/${displayUsername}` : "/profile";

  return (
    <Link className="app-profile-menu flex items-center gap-2 p-1 no-underline transition hover:opacity-80 sm:gap-2.5 sm:pr-2" href={profileUrl} aria-label="Open profile">
      {user.image ? (
        <img className="h-9.5 w-9.5 rounded-full object-cover" src={user.image} alt="" />
      ) : (
        <span className="grid h-9.5 w-9.5 place-items-center rounded-full bg-[#176a5a] font-bold text-[#fffefa]">{name[0].toUpperCase()}</span>
      )}
      <span className="hidden min-w-34 grid-cols-1 gap-0.5 sm:grid">
        <strong className="text-xs text-[#f7f5ed]">{name}</strong>
        <span className="text-[11px] text-[#aab2ad]">@{username}</span>
      </span>
    </Link>
  );
}
