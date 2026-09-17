import { auth } from "./src/auth";

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
