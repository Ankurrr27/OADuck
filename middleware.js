import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

const protectedMiddleware = auth((request) => {
  const isSetupPasswordRoute = request.nextUrl.pathname === "/setup-password";

  if (!request.auth) {
    if (isSetupPasswordRoute) {
      return Response.redirect(new URL("/", request.url));
    }
    // Only redirect to / if not already on /
    if (request.nextUrl.pathname !== "/") {
      return Response.redirect(new URL("/", request.url));
    }
    return;
  }

  const needsPasswordSetup = request.auth.user?.needsPasswordSetup;

  if (needsPasswordSetup && !isSetupPasswordRoute) {
    return Response.redirect(new URL("/setup-password", request.url));
  }

  if (!needsPasswordSetup && isSetupPasswordRoute) {
    return Response.redirect(new URL("/practice", request.url));
  }

  // Redirect /profile exactly to /profile/[username]
  if (request.nextUrl.pathname === "/profile" || request.nextUrl.pathname === "/profile/") {
    const username = request.auth.user?.username || request.auth.user?.email?.split('@')[0];
    if (username) {
      return Response.redirect(new URL(`/profile/${username}`, request.url));
    }
  }
});

export default function middleware(request) {
  // Public profile pages (/profile/someuser) don't require auth
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/profile/") && pathname !== "/profile/") {
    return;
  }

  const oversizedAuthCookies = request.cookies
    .getAll()
    .filter(({ name }) => /^(?:__Secure-)?(?:authjs|next-auth)\./.test(name));

  if (
    request.headers.get("cookie")?.length > 12000 &&
    oversizedAuthCookies.length > 0
  ) {
    const response = NextResponse.redirect(new URL("/", request.url));

    for (const { name } of oversizedAuthCookies) {
      response.cookies.set(name, "", { maxAge: 0, path: "/" });
    }

    return response;
  }

  return protectedMiddleware(request);
}

export const config = {
  matcher: [
    "/",
    "/profile/:path*",
    "/practice/:path*",
    "/questions/:path*",
    "/stats/:path*",
    "/how-to-use/:path*",
    "/setup-password",
  ],
};
