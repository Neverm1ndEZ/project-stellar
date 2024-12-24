import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  //   publicProcedure,
} from "@/server/api/trpc";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { orders } from "@/server/db/schema";

export const postRouter = createTRPCRouter({
  getAllOrdersByUserId: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await db.query.orders.findMany({
        where: eq(orders.userId, ctx.session.user.id),
      });
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch orders",
        cause: error,
      });
    }
  }),

  getOrderById: protectedProcedure
    .input(z.number().positive())
    .query(async ({ input }) => {
      try {
        const order = await db.query.orders.findFirst({
          where: eq(orders.id, input),
        });

        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        return order;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch order",
          cause: error,
        });
      }
    }),

    createOrder: protectedProcedure
    .input(
      z.object({
        products: z.array(
          z.object({
            productId: z.number().positive(),
            quantity: z.number().positive(),
            billAmount: z.number().positive(),
            totalTaxes: z.number().positive(),
            totalPrice: z.number().positive(),
            shippingAddressId: z.number().positive(),
            billingAddressId: z.number().positive(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Take the first product's addresses (assuming all products go to same address)
        const firstProduct = input.products[0];
        
        // Calculate totals from all products
        const totalPrice = input.products.reduce((sum, p) => sum + p.totalPrice, 0);
        const totalTaxes = input.products.reduce((sum, p) => sum + p.totalTaxes, 0);
        const billAmount = input.products.reduce((sum, p) => sum + p.billAmount, 0);
  
        const order = await db.insert(orders).values({
          userId: ctx.session.user.id,
          status: "PENDING",
          shippingAddressId: firstProduct!.shippingAddressId,
          billingAddressId: firstProduct!.billingAddressId,
          totalPrice,
          totalTaxes,
          billAmount,
        });
  
        return order;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create order",
          cause: error,
        });
      }
    }),
});
