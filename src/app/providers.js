"use client";

import { SessionProvider } from "next-auth/react";
import SetPasswordModal from "./components/SetPasswordModal";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      {children}
      <SetPasswordModal />
    </SessionProvider>
  );
}