// src/server/api/routers/address.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { addresses } from "@/server/db/schema";

const addressSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(6),
  type: z.enum(["shipping", "billing"]).default("shipping"),
});

const addressInputSchema = z.object({
  addressLineOne: z.string().min(1, "Address is required"),
  addressLineTwo: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().regex(/^\d{6}$/, "Enter valid 6-digit postal code"),
  type: z.enum(["HOME", "OFFICE", "OTHER"]),
});

export const addressRouter = createTRPCRouter({
  getUserAddresses: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userAddresses = await db.query.addresses.findMany({
        where: eq(addresses.userId, ctx.session.user.id),
        orderBy: (addresses, { desc }) => [desc(addresses.createdAt)],
      });

      return userAddresses;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch addresses",
        cause: error,
      });
    }
  }),

  createAddress: protectedProcedure
    .input(addressInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Insert new address with all required fields
        const [newAddress] = await db
          .insert(addresses)
          .values({
            userId: ctx.session.user.id,
            addressLineOne: input.addressLineOne,
            addressLineTwo: input.addressLineTwo || null,
            city: input.city,
            state: input.state,
            postalCode: input.postalCode,
            type: input.type,
            country: "India", // Default for now
            // These would come from a geocoding service in production
            latitude: "0",
            longitude: "0",
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        if (!newAddress) {
          throw new Error("Failed to create address");
        }

        return newAddress;
      } catch (error) {
        console.error("Address creation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save address",
          cause: error,
        });
      }
    }),

  updateAddress: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: addressSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if address belongs to user
        const address = await db.query.addresses.findFirst({
          where: eq(addresses.id, input.id),
        });

        if (!address || address.userId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Address not found",
          });
        }

        // Update address using Drizzle
        const [updatedAddress] = await db
          .update(addresses)
          .set({
            addressLineOne: input.data.address,
            city: input.data.city,
            state: input.data.state,
            postalCode: input.data.pincode,
            type: input.data.type,
            updatedAt: new Date(),
          })
          .where(eq(addresses.id, input.id))
          .returning();

        return updatedAddress;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update address",
          cause: error,
        });
      }
    }),

  deleteAddress: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if address belongs to user
        const address = await db.query.addresses.findFirst({
          where: eq(addresses.id, input),
        });

        if (!address || address.userId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Address not found",
          });
        }

        // Delete address using Drizzle
        await db.delete(addresses).where(eq(addresses.id, input));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete address",
          cause: error,
        });
      }
    }),
});
