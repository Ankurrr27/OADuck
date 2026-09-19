import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import prisma from "./lib/prisma";
import bcrypt from "bcryptjs";

async function generateUniqueUsername(name) {
  let baseUsername = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'user';
  if (!baseUsername) baseUsername = 'user';
  let username = baseUsername;
  let isUnique = false;
  
  while (!isUnique) {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (!existing) {
      isUnique = true;
    } else {
      username = `${baseUsername}${Math.floor(Math.random() * 1000)}`;
    }
  }
  return username;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        if (!user || !user.password) {
          return null; // No user found, or user signed up with Google and has no password
        }
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          return null;
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      if (account?.provider === "google") {
        const isAdmin = user.email.toLowerCase() === process.env.AUTH_ADMIN_EMAIL?.toLowerCase();
        
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        });

        if (existingUser) {
          await prisma.user.update({
            where: { email: user.email },
            data: {
              name: user.name ?? undefined,
              image: user.image ?? undefined,
              role: isAdmin ? "ADMIN" : undefined,
            }
          });
        } else {
          const username = await generateUniqueUsername(user.name);
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              username,
              role: isAdmin ? "ADMIN" : "USER",
            }
          });
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (token.email) {
        const databaseUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { role: true, username: true, password: true, image: true, name: true },
        });
        
        if (databaseUser) {
          token.role = databaseUser.role;
          token.username = databaseUser.username;
          token.hasPassword = !!databaseUser.password;
          token.image = databaseUser.image;
          token.name = databaseUser.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.hasPassword = token.hasPassword;
        session.user.image = token.image;
        session.user.name = token.name;
      }
      return session;
    },
  },
});