"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import BrandLogo from "./BrandLogo";
import ProfileMenu from "./ProfileMenu";

export default function AppHeader() {
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
    document.querySelector(".mobile-sidebar-toggle")?.click();
  }

  return (
    <header className="flex items-center justify-between border-b border-[#292d2f] bg-[#111416] px-[clamp(14px,6vw,86px)] py-2 sm:py-3">
      <BrandLogo dark />
      
      <div className="ml-auto flex items-center gap-4">
        {isAdmin && (
          <select 
            value={viewRole} 
            onChange={handleRoleChange}
            className="cursor-pointer rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white outline-none"
          >
            <option value="ADMIN" style={{ color: "#000" }}>Admin View</option>
            <option value="USER" style={{ color: "#000" }}>User View</option>
          </select>
        )}
        <ProfileMenu />
      </div>

      <button className="ml-2 flex h-9 w-9 items-center justify-center border-0 bg-transparent text-[#f7f5ed] md:hidden" type="button" onClick={openSidebar} aria-label="Open navigation">
        <svg className="h-5 w-5 fill-none stroke-current [stroke-linecap:round] [stroke-width:1.7]" aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
    </header>
  );
}
