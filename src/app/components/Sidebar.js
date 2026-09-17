"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        className="mobile-sidebar-toggle"
        type="button"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open navigation"
        title="Open navigation"
      >
        <MenuIcon />
      </button>
      <button
        className={`sidebar-backdrop ${sidebarOpen ? "is-visible" : ""}`}
        type="button"
        aria-label="Close navigation"
        onClick={() => setSidebarOpen(false)}
      />
      <aside className={`dashboard-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <button
          className="sidebar-toggle"
          type="button"
          onClick={() => setSidebarOpen((isOpen) => !isOpen)}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <MenuIcon />
        </button>
        <nav className="sidebar-nav" aria-label="Dashboard tools">
          <Link className={`sidebar-tool ${pathname === "/profile" ? "active" : ""}`} href="/profile" title="Edit profile" onClick={() => setSidebarOpen(false)}>
            <ProfileIcon />
            <span>Profile</span>
          </Link>
          <Link className={`sidebar-tool ${pathname.startsWith("/practice") ? "active" : ""}`} href="/practice" title="Practice questions" onClick={() => setSidebarOpen(false)}>
            <PracticeIcon />
            <span>Practice</span>
          </Link>
          <Link className={`sidebar-tool ${pathname === "/questions" ? "active" : ""}`} href="/questions" title="Question library" onClick={() => setSidebarOpen(false)}>
            <LibraryIcon />
            <span>Library</span>
          </Link>
          <Link className={`sidebar-tool ${pathname === "/stats" ? "active" : ""}`} href="/stats" title="View stats" onClick={() => setSidebarOpen(false)}>
            <StatsIcon />
            <span>Stats</span>
          </Link>
          <Link className={`sidebar-tool ${pathname === "/how-to-use" ? "active" : ""}`} href="/how-to-use" title="How to use OA Duck" onClick={() => setSidebarOpen(false)}>
            <HelpIcon />
            <span>How to use</span>
          </Link>
        </nav>
        <button
          className="sidebar-tool sidebar-logout"
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          title="Sign out"
        >
          <LogoutIcon />
          <span>Sign out</span>
        </button>
      </aside>
    </>
  );
}

function MenuIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
}

function ProfileIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.8-3.4 3.1-5 7-5s6.2 1.6 7 5" /></svg>;
}

function StatsIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 19V9M12 19V5M19 19v-7" /></svg>;
}

function PracticeIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /><path d="M4 4h16v16H4z" /></svg>;
}

function LibraryIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 4h12v16H6zM9 8h6M9 12h6M9 16h4" /></svg>;
}

function HelpIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><path d="M9.7 9a2.4 2.4 0 1 1 3.9 1.8c-.9.7-1.6 1.1-1.6 2.4M12 16.5h.01" /></svg>;
}

function LogoutIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10" /></svg>;
}
