"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const pathname = usePathname();
  const { data: session } = useSession();
  const [viewRole, setViewRole] = useState("ADMIN");

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      const stored = localStorage.getItem("viewRole");
      if (stored) setViewRole(stored);

      const handleRoleChange = (e) => setViewRole(e.detail);
      window.addEventListener("viewRoleChange", handleRoleChange);
      return () => window.removeEventListener("viewRoleChange", handleRoleChange);
    }
  }, [session]);

  const profileUrl = session?.user?.username 
    ? `/profile/${session.user.username}` 
    : (session?.user?.email ? `/profile/${session.user.email.split('@')[0]}` : "/profile");

  function startResize(event) {
    if (window.innerWidth < 768) return;

    event.preventDefault();
    const startX = event.clientX;
    const startWidth = sidebarWidth;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    const resize = (moveEvent) => {
      const nextWidth = Math.min(360, Math.max(180, startWidth + moveEvent.clientX - startX));
      setSidebarWidth(nextWidth);
    };

    const stopResize = () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      window.removeEventListener("pointermove", resize);
      window.removeEventListener("pointerup", stopResize);
    };

    window.addEventListener("pointermove", resize);
    window.addEventListener("pointerup", stopResize, { once: true });
  }

  return (
    <>
      <button
        className="hidden"
        type="button"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open navigation"
        title="Open navigation"
      >
        <MenuIcon />
      </button>
      <button
        className={`fixed inset-x-0 bottom-0 top-[52px] z-10 border-0 bg-[#17221e]/20 md:hidden ${sidebarOpen ? "block" : "hidden"}`}
        type="button"
        aria-label="Close navigation"
        onClick={() => setSidebarOpen(false)}
      />
      <aside
        className={`fixed inset-y-[52px] left-0 z-20 w-[min(264px,78vw)] border-r border-[#dfe1da] bg-[#fffefa] p-3 shadow-xl transition-transform md:relative md:inset-y-auto md:left-auto md:min-h-[calc(100vh-79px)] md:w-[var(--sidebar-width)] md:flex-none md:p-2 md:shadow-none ${sidebarOpen ? "translate-x-0" : "-translate-x-[105%] md:translate-x-0"}`}
        style={{ "--sidebar-width": `${sidebarWidth}px` }}
      >
        <nav className="grid gap-1" aria-label="Dashboard tools">
          {session?.user?.role === "ADMIN" && viewRole === "ADMIN" ? (
            <>
              <Link className={`flex min-h-10 items-center gap-3 rounded-md px-2.5 text-xs font-semibold text-[#6f7771] hover:bg-[#eef0e9] hover:text-[#123f36] ${pathname === "/admin" ? "bg-[#eef0e9] text-[#123f36] shadow-[inset_3px_0_0_#f5c75d]" : ""}`} href="/admin" title="Admin dashboard" onClick={() => setSidebarOpen(false)}>
                <AdminIcon />
                <span>Dashboard</span>
              </Link>
              <Link className={`flex min-h-10 items-center gap-3 rounded-md px-2.5 text-xs font-semibold text-[#6f7771] hover:bg-[#eef0e9] hover:text-[#123f36] ${pathname === "/admin/users" ? "bg-[#eef0e9] text-[#123f36] shadow-[inset_3px_0_0_#f5c75d]" : ""}`} href="/admin/users" title="Manage users" onClick={() => setSidebarOpen(false)}>
                <UsersIcon />
                <span>Manage Users</span>
              </Link>
              <Link className={`flex min-h-10 items-center gap-3 rounded-md px-2.5 text-xs font-semibold text-[#6f7771] hover:bg-[#eef0e9] hover:text-[#123f36] ${pathname === "/admin/questions" ? "bg-[#eef0e9] text-[#123f36] shadow-[inset_3px_0_0_#f5c75d]" : ""}`} href="/admin/questions" title="Manage questions" onClick={() => setSidebarOpen(false)}>
                <LibraryIcon />
                <span>Manage Questions</span>
              </Link>
              <Link className={`flex min-h-10 items-center gap-3 rounded-md px-2.5 text-xs font-semibold text-[#6f7771] hover:bg-[#eef0e9] hover:text-[#123f36] ${pathname === "/admin/questions/new" ? "bg-[#eef0e9] text-[#123f36] shadow-[inset_3px_0_0_#f5c75d]" : ""}`} href="/admin/questions/new" title="Add question" onClick={() => setSidebarOpen(false)}>
                <AddIcon />
                <span>Add Question</span>
              </Link>
              <Link className={`flex min-h-10 items-center gap-3 rounded-md px-2.5 text-xs font-semibold text-[#6f7771] hover:bg-[#eef0e9] hover:text-[#123f36] ${pathname === "/admin/new-admin" ? "bg-[#eef0e9] text-[#123f36] shadow-[inset_3px_0_0_#f5c75d]" : ""}`} href="/admin/new-admin" title="Add admin" onClick={() => setSidebarOpen(false)}>
                <AddUserIcon />
                <span>Add Admin</span>
              </Link>
            </>
          ) : (
            <>
              <Link className={`flex min-h-10 items-center gap-3 rounded-md px-2.5 text-xs font-semibold text-[#6f7771] hover:bg-[#eef0e9] hover:text-[#123f36] ${pathname.startsWith("/practice") ? "bg-[#eef0e9] text-[#123f36] shadow-[inset_3px_0_0_#f5c75d]" : ""}`} href="/practice" title="Practice questions" onClick={() => setSidebarOpen(false)}>
                <PracticeIcon />
                <span>Practice</span>
              </Link>
              <Link className={`flex min-h-10 items-center gap-3 rounded-md px-2.5 text-xs font-semibold text-[#6f7771] hover:bg-[#eef0e9] hover:text-[#123f36] ${pathname === "/questions" ? "bg-[#eef0e9] text-[#123f36] shadow-[inset_3px_0_0_#f5c75d]" : ""}`} href="/questions" title="Question library" onClick={() => setSidebarOpen(false)}>
                <LibraryIcon />
                <span>Library</span>
              </Link>
              <Link className={`flex min-h-10 items-center gap-3 rounded-md px-2.5 text-xs font-semibold text-[#6f7771] hover:bg-[#eef0e9] hover:text-[#123f36] ${pathname === "/stats" ? "bg-[#eef0e9] text-[#123f36] shadow-[inset_3px_0_0_#f5c75d]" : ""}`} href="/stats" title="View stats" onClick={() => setSidebarOpen(false)}>
                <StatsIcon />
                <span>Stats</span>
              </Link>
              <Link className={`flex min-h-10 items-center gap-3 rounded-md px-2.5 text-xs font-semibold text-[#6f7771] hover:bg-[#eef0e9] hover:text-[#123f36] ${pathname === "/how-to-use" ? "bg-[#eef0e9] text-[#123f36] shadow-[inset_3px_0_0_#f5c75d]" : ""}`} href="/how-to-use" title="How to use OA Duck" onClick={() => setSidebarOpen(false)}>
                <HelpIcon />
                <span>How to use</span>
              </Link>
              <Link className={`mt-4 flex min-h-10 items-center gap-3 rounded-md px-2.5 text-xs font-semibold text-[#6f7771] hover:bg-[#eef0e9] hover:text-[#123f36] ${pathname.startsWith("/profile") ? "bg-[#eef0e9] text-[#123f36] shadow-[inset_3px_0_0_#f5c75d]" : ""}`} href={profileUrl} title="Edit profile" onClick={() => setSidebarOpen(false)}>
                <ProfileIcon />
                <span>Profile</span>
              </Link>
            </>
          )}
        </nav>
        <button
          className="mt-7 flex min-h-10 w-full items-center gap-3 rounded-md border-0 bg-transparent px-2.5 text-left text-xs font-semibold text-[#9b6257] hover:bg-[#f8ece9] hover:text-[#9b4032]"
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          title="Sign out"
        >
          <LogoutIcon />
          <span>Sign out</span>
        </button>
        <button
          className="absolute right-[-5px] top-0 hidden h-full w-2 cursor-col-resize border-0 bg-transparent p-0 md:block"
          type="button"
          onPointerDown={startResize}
          aria-label="Resize sidebar"
          title="Drag to resize sidebar"
        >
          <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-transparent transition-colors hover:bg-[#176a5a]" />
        </button>
      </aside>
    </>
  );
}

function MenuIcon() {
  return <svg className="h-5 w-5 shrink-0 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.7]" aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
}

function ProfileIcon() {
  return <svg className="h-5 w-5 shrink-0 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.7]" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.8-3.4 3.1-5 7-5s6.2 1.6 7 5" /></svg>;
}

function StatsIcon() {
  return <svg className="h-5 w-5 shrink-0 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.7]" aria-hidden="true" viewBox="0 0 24 24"><path d="M5 19V9M12 19V5M19 19v-7" /></svg>;
}

function PracticeIcon() {
  return <svg className="h-5 w-5 shrink-0 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.7]" aria-hidden="true" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /><path d="M4 4h16v16H4z" /></svg>;
}

function LibraryIcon() {
  return <svg className="h-5 w-5 shrink-0 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.7]" aria-hidden="true" viewBox="0 0 24 24"><path d="M6 4h12v16H6zM9 8h6M9 12h6M9 16h4" /></svg>;
}

function HelpIcon() {
  return <svg className="h-5 w-5 shrink-0 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.7]" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><path d="M9.7 9a2.4 2.4 0 1 1 3.9 1.8c-.9.7-1.6 1.1-1.6 2.4M12 16.5h.01" /></svg>;
}

function LogoutIcon() {
  return <svg className="h-5 w-5 shrink-0 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.7]" aria-hidden="true" viewBox="0 0 24 24"><path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10" /></svg>;
}

function AdminIcon() {
  return <svg className="h-5 w-5 shrink-0 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.7]" aria-hidden="true" viewBox="0 0 24 24"><path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" /><path d="M9 12l2 2 4-4" /></svg>;
}

function AddIcon() {
  return <svg className="h-5 w-5 shrink-0" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>;
}

function UsersIcon() {
  return <svg className="h-5 w-5 shrink-0" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}

function AddUserIcon() {
  return <svg className="h-5 w-5 shrink-0" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/></svg>;
}
