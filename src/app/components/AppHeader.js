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
    <header className="dashboard-header">
      <BrandLogo />
      
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "1rem" }}>
        {isAdmin && (
          <select 
            value={viewRole} 
            onChange={handleRoleChange}
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "0.4rem 0.8rem",
              borderRadius: "6px",
              fontSize: "0.85rem",
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="ADMIN" style={{ color: "#000" }}>Admin View</option>
            <option value="USER" style={{ color: "#000" }}>User View</option>
          </select>
        )}
        <ProfileMenu />
      </div>

      <button className="header-menu-toggle" type="button" onClick={openSidebar} aria-label="Open navigation">
        <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
    </header>
  );
}
