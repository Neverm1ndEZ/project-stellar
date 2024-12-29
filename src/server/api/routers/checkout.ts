// src/server/api/routers/checkout.ts
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { checkoutSchema } from "@/server/db/checkout-schema";
import { orderItems, orders, payments } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

export const checkoutRouter = createTRPCRouter({
  processCheckout: protectedProcedure
    .input(checkoutSchema)
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;

      try {
        // Start a transaction
        return await db.transaction(async (tx) => {
          // Create the order
          const [order] = await tx
            .insert(orders)
            .values({
              userId: session.user.id,
              status: "PENDING",
              shippingAddressId: input.address.id,
              billingAddressId: input.address.id,
              totalPrice: input.totalAmount,
              totalTaxes: input.taxes,
              billAmount: input.finalAmount,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();

          // Create order items
          await tx.insert(orderItems).values(
            input.items.map((item) => ({
              orderId: order.id,
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
              createdAt: new Date(),
              updatedAt: new Date(),
            })),
          );

          // Process payment based on method
          let paymentStatus: string;
          switch (input.payment.method) {
            case "card":
              // Integrate with payment gateway here
              paymentStatus = "PAID";
              break;
            case "upi":
              // Integrate with UPI provider here
              paymentStatus = "PAID";
              break;
            case "cod":
              paymentStatus = "PENDING";
              break;
            default:
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Invalid payment method",
              });
          }

          // Record payment
          await tx.insert(payments).values({
            orderId: order.id,
            paymentMethod: input.payment.method,
            paymentStatus,
            paymentDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          return {
            success: true,
            orderId: order.id,
            status: paymentStatus,
          };
        });
      } catch (error) {
        console.error("Checkout error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process checkout",
          cause: error,
        });
      }
    }),
});
