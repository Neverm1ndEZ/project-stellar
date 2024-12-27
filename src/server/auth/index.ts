// src/server/auth/index.ts
import NextAuth from "next-auth";
import { cache } from "react";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { users } from "@/server/db/schema";
import { authConfig } from "./config";

const createAuth = () => {
  return NextAuth({
    ...authConfig,
    // Add more debug logs to track session creation
    events: {
      async signIn({ user, account, profile }) {
        console.log("SignIn event:", {
          userId: user.id,
          provider: account?.provider,
        });
      },
      async session({ session, token }) {
        console.log("Session event:", {
          sessionUserId: session?.user?.id,
          tokenSub: token.sub,
        });
      },
    },
    callbacks: {
      async jwt({ token, user, account, trigger }) {
        // Log jwt callback
        console.log("JWT Callback:", {
          hasUser: !!user,
          trigger,
          tokenSub: token.sub,
        });

        if (user) {
          token.id = user.id;
          token.phoneVerified = user.phoneVerified;
        }
        return token;
      },

      async session({ session, token }) {
        // Log session callback
        console.log("Session Callback:", {
          hasToken: !!token,
          tokenId: token?.sub,
        });

        if (token && session.user) {
          session.user.id = token.sub!;

          // Fetch fresh user data
          const user = await db.query.users.findFirst({
            where: eq(users.id, token.sub!),
            columns: {
              phoneVerified: true,
              phoneNumber: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          });

          if (user) {
            session.user.phoneVerified = user.phoneVerified;
            session.user.phoneNumber = user.phoneNumber;
            session.user.email = user.email;
            session.user.firstName = user.firstName;
            session.user.lastName = user.lastName;
          }
        }

        return session;
      },
    },
  });
};

// Create cached auth instance
const { auth: baseAuth, handlers, signIn, signOut } = createAuth();
export const auth = cache(baseAuth);

// Export auth utilities
export { handlers, signIn, signOut };
