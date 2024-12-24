import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { cartItems, carts, orders, products } from "@/server/db/schema";

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
        const totalPrice = input.products.reduce(
          (sum, p) => sum + p.totalPrice,
          0,
        );
        const totalTaxes = input.products.reduce(
          (sum, p) => sum + p.totalTaxes,
          0,
        );
        const billAmount = input.products.reduce(
          (sum, p) => sum + p.billAmount,
          0,
        );

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

  updateOrderStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.number().positive(),
        status: z.enum(["PENDING", "SHIPPED", "DELIVERED"]),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const order = await db.query.orders.findFirst({
          where: eq(orders.id, input.orderId),
        });

        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        await db
          .update(orders)
          .set({
            status: input.status,
          })
          .where(eq(orders.id, input.orderId));

        return order;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update order status",
          cause: error,
        });
      }
    }),

  deleteOrderById: protectedProcedure
    .input(z.number().positive())
    .mutation(async ({ input }) => {
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

        await db.delete(orders).where(eq(orders.id, input));

        return order;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete order",
          cause: error,
        });
      }
    }),

  // cart related operations

  addToCart: protectedProcedure
  .input(
    z.object({
      productId: z.number().positive(),
      quantity: z.number().positive(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    try {
      // First check if product exists
      const product = await db.query.products.findFirst({
        where: eq(products.id, input.productId),
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Check if user has a cart
      let userCart = await db.query.carts.findFirst({
        where: eq(carts.userId, ctx.session.user.id),
      });

      // If no cart exists, create one
      if (!userCart) {
        const newCart = await db.insert(carts)
          .values({
            userId: ctx.session.user.id,
          })
          .returning();
        userCart = newCart[0];
      }

      // Check if item already exists in cart
      const cartItem = await db.query.cartItems.findFirst({
        where: and(
          eq(cartItems.cartId, userCart!.id),
          eq(cartItems.productId, input.productId),
        ),
      });

      if (cartItem) {
        // Update quantity if item exists
        await db
          .update(cartItems)
          .set({
            quantity: cartItem.quantity + input.quantity,
          })
          .where(
            and(
              eq(cartItems.cartId, userCart!.id),
              eq(cartItems.productId, input.productId),
            ),
          );
      } else {
        // Add new item if it doesn't exist
        await db.insert(cartItems).values({
          cartId: userCart!.id,
          productId: input.productId,
          quantity: input.quantity,
          price: product.sellingPrice,
        });
      }

      return product;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to add to cart",
        cause: error,
      });
    }
    }),

   
});
