import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authConfig from "../auth.config";
import { compare } from "bcryptjs";
import prisma from "./lib/prisma";
import crypto from "crypto";
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
          username: "user_" + crypto.randomUUID().slice(0, 8),
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
          select: { role: true, username: true, passwordHash: true },
        });

        token.role = databaseUser?.role;
        token.username = databaseUser?.username;
        token.needsPasswordSetup = !databaseUser?.passwordHash;
      }

      delete token.name;
      delete token.picture;

      return token;
    },
    async session({ session, token, trigger, newSession }) {
      if (token.email) {
        const databaseUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { name: true, image: true },
        });

        session.user.name = databaseUser?.name;
        session.user.image = databaseUser?.image;
      }

      if (trigger === "update" && newSession) {
        if (Object.prototype.hasOwnProperty.call(newSession, "name")) {
          session.user.name = newSession.name;
        }
        if (Object.prototype.hasOwnProperty.call(newSession, "image")) {
          session.user.image = newSession.image;
        }
        if (Object.prototype.hasOwnProperty.call(newSession, "needsPasswordSetup")) {
          session.user.needsPasswordSetup = newSession.needsPasswordSetup;
          token.needsPasswordSetup = newSession.needsPasswordSetup; // important to update token too if jwt strategy
        }
        if (Object.prototype.hasOwnProperty.call(newSession, "username")) {
          session.user.username = newSession.username;
          token.username = newSession.username;
        }
      }

      session.user.role = token.role;
      session.user.username = token.username;
      session.user.needsPasswordSetup = token.needsPasswordSetup;
      return session;
    },
  },
});