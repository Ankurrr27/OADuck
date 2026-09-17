import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  if (!request.auth) {
    return Response.redirect(new URL("/", request.url));
  }
});

export const config = {
  matcher: [
    "/profile/:path*",
    "/practice/:path*",
    "/questions/:path*",
    "/stats/:path*",
    "/how-to-use/:path*",
  ],
};
