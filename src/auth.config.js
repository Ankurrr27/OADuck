export const authConfig = {
  providers: [],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = nextUrl.pathname.startsWith("/profile") || 
                          nextUrl.pathname.startsWith("/practice") || 
                          nextUrl.pathname.startsWith("/questions") || 
                          nextUrl.pathname.startsWith("/stats");
                          
      if (isProtected && !isLoggedIn) {
        return false;
      }
      return true;
    }
  }
};
