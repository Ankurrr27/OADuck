import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

const protectedMiddleware = auth((request) => {
  if (!request.auth) {
    return Response.redirect(new URL("/", request.url));
  }
});

export default function middleware(request) {
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
  ],
};
