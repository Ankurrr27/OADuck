"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import BrandLogo from "./BrandLogo";
import ProfileMenu from "./ProfileMenu";

function formatTimer(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function AssessmentTimer({ startedAt, durationMinutes }) {
  const [now, setNow] = useState(0);
  const [direction, setDirection] = useState("elapsed");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setNow(Date.now()));
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(interval);
    };
  }, []);

  const elapsed = Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 1000));
  const seconds = direction === "elapsed" ? elapsed : Math.max(0, durationMinutes * 60 - elapsed);
  return <button className="assessment-header-timer" type="button" onClick={() => setDirection((current) => current === "elapsed" ? "remaining" : "elapsed")} aria-label={`Timer shows ${direction}. Click to show ${direction === "elapsed" ? "remaining" : "elapsed"} time`} title="Click to switch between elapsed and remaining time">
    <span>{direction === "elapsed" ? "Elapsed" : "Remaining"}</span><strong>{formatTimer(seconds)}</strong>
  </button>;
}

export default function AppHeader({ assessmentTimer }) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = session?.user?.role === "ADMIN";
  const [viewRole, setViewRole] = useState("ADMIN");

  useEffect(() => {
    if (isAdmin) {
      const stored = localStorage.getItem("viewRole");
      if (stored) setViewRole(stored);
    }
  }, [isAdmin]);

  function handleRoleChange(e) {
    const newRole = e.target.value;
    setViewRole(newRole);
    localStorage.setItem("viewRole", newRole);
    window.dispatchEvent(new CustomEvent("viewRoleChange", { detail: newRole }));
    
    if (newRole === "ADMIN") {
      router.push("/admin");
    } else if (newRole === "USER" && pathname.startsWith("/admin")) {
      router.push("/questions");
    }
  }

  function openSidebar() {
    window.dispatchEvent(new CustomEvent("mobileSidebarToggle"));
  }

  return (
    <header className={`app-header sticky top-0 z-30 flex h-12 items-center justify-between bg-[#111416] px-4 sm:px-6 md:h-14 md:px-[clamp(24px,6vw,86px)] md:py-0 ${assessmentTimer ? "app-header--assessment" : ""}`}>
      <div className="app-header__brand-group"><BrandLogo dark />{assessmentTimer && <AssessmentTimer startedAt={assessmentTimer.startedAt} durationMinutes={assessmentTimer.durationMinutes} />}</div>
      {assessmentTimer && <span className="app-header__candidate">{session?.user?.name || session?.user?.email?.split("@")[0] || "Candidate"}</span>}
      
      <div className={`flex items-center gap-2 sm:gap-3 ${assessmentTimer ? "app-header__right" : "ml-auto"}`}>
        {isAdmin && (
          <select 
            value={viewRole} 
            onChange={handleRoleChange}
            className="hidden cursor-pointer rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white outline-none transition hover:bg-white/10 sm:block"
          >
            <option value="ADMIN" style={{ color: "#000" }}>Admin View</option>
            <option value="USER" style={{ color: "#000" }}>User View</option>
          </select>
        )}
        <ProfileMenu />
        <button className="grid h-10 w-10 place-items-center bg-transparent text-[#f7f5ed] transition hover:text-[#f5c75d] active:scale-95 md:hidden" type="button" onClick={openSidebar} aria-label="Open navigation">
          <svg className="h-5 w-5 fill-none stroke-current [stroke-linecap:round] [stroke-width:1.7]" aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
      </div>

    </header>
  );
}
