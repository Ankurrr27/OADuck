"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function LogoutPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  return <main className="auth-panel"><p className="mt-4 text-sm text-[#6f7771]">Signing you out...</p></main>;
}
