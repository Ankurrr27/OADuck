import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authConfig from "../auth.config";
import { compare } from "bcryptjs";
import prisma from "./lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string"
          ? credentials.email.trim().toLowerCase()
          : "";
        const password = typeof credentials?.password === "string"
          ? credentials.password
          : "";

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user?.passwordHash || !(await compare(password, user.passwordHash))) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
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