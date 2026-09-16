import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import prisma from "./lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }

      const isAdmin =
        user.email.toLowerCase() === process.env.AUTH_ADMIN_EMAIL?.toLowerCase();

      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name ?? undefined,
          image: user.image ?? undefined,
          role: isAdmin ? "ADMIN" : undefined,
        },
        create: {
          email: user.email,
          name: user.name,
          image: user.image,
          role: isAdmin ? "ADMIN" : "USER",
        },
      });

      return true;
    },
    async jwt({ token }) {
      if (token.email) {
        const databaseUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { role: true },
        });
        token.role = databaseUser?.role;
      }

      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    },
  },
});