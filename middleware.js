import NextAuth from "next-auth";
import { authConfig } from "./src/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/profile/:path*",
    "/practice/:path*",
    "/questions/:path*",
    "/stats/:path*",
    "/how-to-use/:path*",
  ],
};
