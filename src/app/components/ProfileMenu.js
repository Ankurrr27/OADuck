"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function ProfileMenu() {
  const { data: session } = useSession();
  const user = session?.user || {};
  const name = user.name || "OA Duck learner";
  const username = user.email?.split("@")[0] || "learner";

  return (
    <Link className="profile-menu profile-menu-link" href="/profile" aria-label="Open profile">
      {user.image ? (
        <img className="profile-avatar" src={user.image} alt="" />
      ) : (
        <span className="profile-avatar profile-fallback">{name[0].toUpperCase()}</span>
      )}
      <span className="profile-details">
        <strong>{name}</strong>
        <span>@{username}</span>
      </span>
    </Link>
  );
}
