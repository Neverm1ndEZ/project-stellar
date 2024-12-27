// src/server/auth/config.ts
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { env } from "@/env";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Extend session types with custom fields
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      phoneNumber: string | null;
      emailVerified: Date | null;
      phoneVerified: boolean;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    emailVerified: Date | null;
    phoneVerified: boolean;
    role: string;
  }
}

export const authConfig = {
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
    error: "/auth/error",
    verifyRequest: "/verify-phone",
  },

  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          name: `${profile.given_name || ""} ${profile.family_name || ""}`.trim(),
          image: profile.picture,
          emailVerified: profile.email_verified ? new Date() : null,
          firstName: profile.given_name || null,
          lastName: profile.family_name || null,
          phoneNumber: null,
          phoneVerified: false,
          role: "user",
        };
      },
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Email or Phone",
      credentials: {
        identifier: {
          label: "Email or Phone",
          type: "text",
        },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials.password) return null;

        try {
          const isEmail = credentials.identifier.includes("@");
          const user = await db.query.users.findFirst({
            where: isEmail
              ? eq(users.email, credentials.identifier)
              : eq(users.phoneNumber, credentials.identifier),
          });

          if (!user?.password) return null;

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password,
          );
          if (!isValid) return null;

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`.trim() || null,
            image: null,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            phoneVerified: Boolean(user.phoneNumber),
            emailVerified: user.emailVerified,
            role: user.role || "user",
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!; // This is crucial!
      }
      return session;
    },

    async signIn({ user, account }) {
      // For Google sign-in, always redirect to phone verification if phone not verified
      if (account?.provider === "google" && !user.phoneVerified) {
        return `/verify-phone?email=${encodeURIComponent(user.email)}`;
      }
      return true;
    },
  },

  events: {
    async createUser({ user }) {
      try {
        await db
          .update(users)
          .set({
            role: "user",
            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id));
      } catch (error) {
        console.error("Error in createUser event:", error);
      }
    },
  },
} satisfies NextAuthConfig;
