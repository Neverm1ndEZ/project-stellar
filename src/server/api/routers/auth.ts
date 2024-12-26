// src/server/api/routers/auth.ts

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const authRouter = createTRPCRouter({
  // This procedure updates the user's phone number and marks it as verified
  verifyPhone: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { phoneNumber } = input;
      const userId = ctx.session.user.id;

      // Update the user record with the verified phone number
      const updatedUser = await ctx.db
        .update(users)
        .set({
          phoneNumber,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      return updatedUser;
    }),

  // This procedure checks if a user's phone is verified
  checkPhoneVerification: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        phoneNumber: true,
      },
    });

    return {
      isVerified: Boolean(user?.phoneNumber),
    };
  }),
});
