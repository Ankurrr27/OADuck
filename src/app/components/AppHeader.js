"use client";

import BrandLogo from "./BrandLogo";
import ProfileMenu from "./ProfileMenu";

export default function AppHeader() {
  function openSidebar() {
    document.querySelector(".mobile-sidebar-toggle")?.click();
  }

  return (
    <header className="dashboard-header">
      <BrandLogo />
      <ProfileMenu />
      <button className="header-menu-toggle" type="button" onClick={openSidebar} aria-label="Open navigation">
        <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
    </header>
  );
}
