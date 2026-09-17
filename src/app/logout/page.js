"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function LogoutPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  return <main className="auth-panel"><p className="inner-page-lede">Signing you out...</p></main>;
}
