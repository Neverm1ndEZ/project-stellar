// src/server/auth/config.ts

import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/server/db";
import { users, accounts } from "@/server/db/schema";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Extend the default session types to include our custom fields
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      firstName: string | null;
      lastName: string | null;
      phoneNumber: string | null;
    } & DefaultSession["user"];
  }

  // Extend the user type to match our database schema
  interface User {
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
  }
}

export const authConfig = {
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Customize the profile data we receive from Google
      profile(profile: {
        sub: string;
        email: string;
        name: string;
        picture: string;
        given_name?: string;
        family_name?: string;
        email_verified?: boolean;
      }) {
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          firstName: profile.given_name || null,
          lastName: profile.family_name || null,
          phoneNumber: null, // Initialize phone as null for Google users
          emailVerified: profile.email_verified ? new Date() : null,
        };
      },
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        emailOrPhone: { label: "Email or Phone", type: "text", required: true },
        password: { label: "Password", type: "password", required: true },
      } as const,
      async authorize(credentials) {
        if (!credentials?.emailOrPhone || !credentials.password) {
          return null;
        }

        // Look up user by either email or phone number
        const user = await db.query.users.findFirst({
          where: or(
            eq(users.email, credentials.emailOrPhone as string),
            eq(users.phoneNumber, credentials.emailOrPhone as string),
          ),
        });

        if (!user?.password) return null;

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!(await isValidPassword)) return null;

        // Return user data matching our extended User interface
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    // Customize the JWT token content
    async jwt({ token, user, account, profile, trigger }) {
      if (user) {
        // Initial sign in - add custom fields to token
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.phoneNumber = user.phoneNumber;
      }

      // Handle token updates when user data changes
      if (trigger === "update" && token.sub) {
        const updatedUser = await db.query.users.findFirst({
          where: eq(users.id, token.sub),
        });
        if (updatedUser) {
          token.firstName = updatedUser.firstName;
          token.lastName = updatedUser.lastName;
          token.phoneNumber = updatedUser.phoneNumber;
        }
      }

      return token;
    },

    // Customize session data based on token
    async session({ session, token }) {
      if (token && token.sub) {
        session.user.id = token.sub;
        session.user.firstName = token.firstName as string | null;
        session.user.lastName = token.lastName as string | null;
        session.user.phoneNumber = token.phoneNumber as string | null;
      }
      return session;
    },

    // Custom sign in handling
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Check if this Google account is already linked
        const existingAccount = await db.query.accounts.findFirst({
          where: eq(accounts.providerAccountId, account.providerAccountId),
        });

        if (!existingAccount) {
          // New Google user - they'll need to verify phone
          return `/verify-phone?email=${encodeURIComponent(user.email)}`;
        }
      }

      return true;
    },
  },
  events: {
    async createUser({ user }) {
      // Additional setup for new users
      if (user.phoneNumber) {
        // For credential sign ups where phone is provided
        await db
          .update(users)
          .set({
            phoneNumber: user.phoneNumber,
            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id));
      }
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
    error: "/auth/error",
  },
} satisfies NextAuthConfig;
