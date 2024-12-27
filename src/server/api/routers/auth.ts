// src/server/api/routers/auth.ts
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";

// Validation schemas with strong typing
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password is too long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

const emailSchema = z
  .string()
  .email("Invalid email address")
  .min(5, "Email is too short")
  .max(255, "Email is too long");

const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format");

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  phone: phoneSchema.optional(),
});

// Validation schemas
const phoneNumberSchema = z
  .string()
  .regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone number format");

const otpSchema = z.string().length(6, "OTP must be 6 digits");

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input }) => {
      try {
        // Check for existing user
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, input.email),
        });

        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already registered",
          });
        }

        // Hash password with strong settings
        const hashedPassword = await bcrypt.hash(input.password, 12);

        // Create new user with safe defaults
        const [newUser] = await db
          .insert(users)
          .values({
            email: input.email,
            password: hashedPassword,
            firstName: input.firstName,
            lastName: input.lastName,
            role: "user",
            emailVerified: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning({
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
          });

        return {
          status: "success",
          data: {
            user: newUser,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error("Registration error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to register user",
        });
      }
    }),

  // Production-ready profile update procedure
  updateProfile: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(1).max(50).optional(),
        lastName: z.string().min(1).max(50).optional(),
        email: emailSchema.optional(),
        currentPassword: z.string().optional(),
        newPassword: passwordSchema.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id;

        // If changing password, verify current password
        if (input.newPassword) {
          if (!input.currentPassword) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Current password is required",
            });
          }

          const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
          });

          if (!user?.password) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid credentials",
            });
          }

          const isValid = await bcrypt.compare(
            input.currentPassword,
            user.password,
          );

          if (!isValid) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Current password is incorrect",
            });
          }
        }

        // Prepare update data
        const updateData: Partial<typeof users.$inferInsert> = {
          updatedAt: new Date(),
        };

        if (input.firstName) updateData.firstName = input.firstName;
        if (input.lastName) updateData.lastName = input.lastName;
        if (input.email) updateData.email = input.email;
        if (input.newPassword) {
          updateData.password = await bcrypt.hash(input.newPassword, 12);
        }

        // Update user profile
        const [updatedUser] = await db
          .update(users)
          .set(updateData)
          .where(eq(users.id, userId))
          .returning({
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            updatedAt: users.updatedAt,
          });

        return {
          status: "success",
          data: {
            user: updatedUser,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error("Profile update error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile",
        });
      }
    }),

  // Mock phone verification (for development)
  verifyPhone: protectedProcedure
    .input(
      z.object({
        phoneNumber: phoneSchema,
        otp: z.string().length(6),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // In production, implement real OTP verification here
      // For now, just update the phone number
      try {
        await db
          .update(users)
          .set({
            phoneNumber: input.phoneNumber,
            updatedAt: new Date(),
          })
          .where(eq(users.id, ctx.session.user.id));

        return {
          status: "success",
          message: "Phone number verified successfully",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify phone number",
        });
      }
    }),

  // Check phone verification status
  checkPhoneVerification: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, ctx.session.user.id),
        columns: {
          phoneNumber: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return {
        isVerified: Boolean(user.phoneNumber),
        phoneNumber: user.phoneNumber,
        lastUpdated: user.updatedAt,
      };
    } catch (error) {
      console.error("Phone verification check error:", error);
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to check verification status",
      });
    }
  }),

  // Start phone verification process
  startPhoneVerification: protectedProcedure
    .input(
      z.object({
        phoneNumber: phoneNumberSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // In production, integrate with SMS service here
        // For development, we'll use a mock OTP
        const mockOtp = "123456";
        if (process.env.NODE_ENV === "development") {
          console.log(`Mock OTP for ${input.phoneNumber}: ${mockOtp}`);
        }

        // Store phone number temporarily
        await db
          .update(users)
          .set({
            phoneNumber: input.phoneNumber,
            updatedAt: new Date(),
          })
          .where(eq(users.id, ctx.session.user.id));

        return {
          success: true,
          message: "Verification code sent successfully",
        };
      } catch (error) {
        console.error("Start verification error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to start verification",
        });
      }
    }),

  // Verify OTP
  verifyPhoneOtp: protectedProcedure
    .input(
      z.object({
        otp: otpSchema,
        phoneNumber: phoneNumberSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // For development, accept mock OTP
        const isValid =
          process.env.NODE_ENV === "development"
            ? input.otp === "123456"
            : false; // In production, verify against SMS service

        if (!isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid verification code",
          });
        }

        // Update user's phone verification status
        const [updatedUser] = await db
          .update(users)
          .set({
            phoneNumber: input.phoneNumber,
            phoneVerified: true,
            updatedAt: new Date(),
          })
          .where(eq(users.id, ctx.session.user.id))
          .returning({
            id: users.id,
            phoneNumber: users.phoneNumber,
            phoneVerified: users.phoneVerified,
          });

        if (!updatedUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        return {
          success: true,
          message: "Phone number verified successfully",
          user: updatedUser,
        };
      } catch (error) {
        console.error("OTP verification error:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify phone number",
        });
      }
    }),
  // Check if email exists (for registration)
  checkEmail: publicProcedure
    .input(z.object({ email: emailSchema }))
    .query(async ({ input }) => {
      const user = await db.query.users.findFirst({
        where: eq(users.email, input.email),
      });
      return { exists: !!user };
    }),
});
