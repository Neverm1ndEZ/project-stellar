// src/server/api/routers/checkout.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";
import { eq, sql } from "drizzle-orm";
import {
  orders,
  orderItems,
  payments,
  cartItems,
  carts,
  products,
  productVariants,
} from "@/server/db/schema";

// Validation schemas
const paymentMethodSchema = z.enum(["card", "upi", "cod"]);

const addressSchema = z.object({
  shippingAddressId: z.number(),
  // billingAddressId: z.number(),
});

const cardDetailsSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/),
  cvv: z.string().regex(/^\d{3}$/),
});

const upiDetailsSchema = z.object({
  upiId: z.string().regex(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/),
});

const paymentDetailsSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal("card"), details: cardDetailsSchema }),
  z.object({ method: z.literal("upi"), details: upiDetailsSchema }),
  z.object({ method: z.literal("cod"), details: z.undefined() }),
]);

export const checkoutRouter = createTRPCRouter({
  // Step 1: Initialize checkout session
  initializeCheckout: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // Verify user has items in cart
      const cart = await db.query.carts.findFirst({
        where: eq(carts.userId, ctx.session.user.id),
        with: {
          items: {
            with: {
              product: true,
              variant: true,
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Your cart is empty",
        });
      }

      // Verify inventory for all items
      for (const item of cart.items) {
        const availableQuantity = item.variant
          ? item.variant.availableQuantity
          : item.product.availableQuantity;

        if (item.quantity > availableQuantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient inventory for ${item.product.name}`,
          });
        }
      }

      // Calculate totals
      const subtotal = cart.items.reduce((sum, item) => sum + item.price, 0);
      const shipping = subtotal > 500 ? 0 : 50;
      const tax = subtotal * 0.18;
      const total = subtotal + shipping + tax;

      return {
        cartId: cart.id,
        summary: {
          subtotal,
          shipping,
          tax,
          total,
        },
        itemCount: cart.items.length,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      console.error("Checkout initialization error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to initialize checkout",
        cause: error,
      });
    }
  }),

  // Step 2: Process payment and create order
  processPayment: protectedProcedure
    .input(
      z.object({
        addresses: addressSchema,
        payment: paymentDetailsSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await db.transaction(async (tx) => {
          // 1. Get cart and validate again
          const cart = await tx.query.carts.findFirst({
            where: eq(carts.userId, ctx.session.user.id),
            with: {
              items: {
                with: {
                  product: true,
                  variant: true,
                },
              },
            },
          });

          if (!cart || cart.items.length === 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Cart is empty",
            });
          }

          // 2. Calculate totals
          const subtotal = cart.items.reduce(
            (sum, item) => sum + item.price,
            0,
          );
          const shipping = subtotal > 500 ? 0 : 50;
          const tax = subtotal * 0.18;
          const total = subtotal + shipping + tax;

          // 3. Create order
          const [order] = await tx
            .insert(orders)
            .values({
              userId: ctx.session.user.id,
              status: "PENDING",
              shippingAddressId: input.addresses.shippingAddressId,
              // billingAddressId: input.addresses.billingAddressId,
              totalPrice: total,
              totalTaxes: tax,
              billAmount: total,
            })
            .returning();

          // 4. Create order items
          await tx.insert(orderItems).values(
            cart.items.map((item) => ({
              orderId: order.id,
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
            })),
          );

          // 5. Update inventory
          for (const item of cart.items) {
            if (item.variant) {
              await tx
                .update(productVariants)
                .set({
                  availableQuantity: sql`${productVariants.availableQuantity} - ${item.quantity}`,
                })
                .where(eq(productVariants.id, item.variantId!));
            } else {
              await tx
                .update(products)
                .set({
                  availableQuantity: sql`${products.availableQuantity} - ${item.quantity}`,
                })
                .where(eq(products.id, item.productId));
            }
          }

          // 6. Simulate payment processing
          const simulatePayment = () => {
            // For development, succeed 90% of the time
            return Math.random() > 0.0;
          };

          const paymentSuccess = simulatePayment();

          if (!paymentSuccess) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Payment processing failed",
            });
          }

          // 7. Record payment
          const [payment] = await tx
            .insert(payments)
            .values({
              orderId: order.id,
              paymentMethod: input.payment.method,
              paymentStatus: "success",
              paymentDate: new Date(),
            })
            .returning();

          // 8. Update order status
          await tx
            .update(orders)
            .set({ status: "PAID" })
            .where(eq(orders.id, order.id));

          // 9. Clear cart
          await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));

          await tx.delete(carts).where(eq(carts.id, cart.id));

          return {
            success: true,
            orderId: order.id,
            paymentId: payment.id,
          };
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process payment",
          cause: error,
        });
      }
    }),
});
