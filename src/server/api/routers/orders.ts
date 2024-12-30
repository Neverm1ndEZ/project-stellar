// import { z } from "zod";

// import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
// import { db } from "@/server/db";
// import { and, eq } from "drizzle-orm";
// import { TRPCError } from "@trpc/server";
// import { cartItems, carts, orders, products } from "@/server/db/schema";

// export const orderRouter = createTRPCRouter({
//   getAllOrdersByUserId: protectedProcedure.query(async ({ ctx }) => {
//     try {
//       return await db.query.orders.findMany({
//         where: eq(orders.userId, ctx.session.user.id),
//       });
//     } catch (error) {
//       throw new TRPCError({
//         code: "INTERNAL_SERVER_ERROR",
//         message: "Failed to fetch orders",
//         cause: error,
//       });
//     }
//   }),

//   getOrderById: protectedProcedure
//     .input(z.number().positive())
//     .query(async ({ input }) => {
//       try {
//         const order = await db.query.orders.findFirst({
//           where: eq(orders.id, input),
//         });

//         if (!order) {
//           throw new TRPCError({
//             code: "NOT_FOUND",
//             message: "Order not found",
//           });
//         }

//         return order;
//       } catch (error) {
//         if (error instanceof TRPCError) throw error;
//         throw new TRPCError({
//           code: "INTERNAL_SERVER_ERROR",
//           message: "Failed to fetch order",
//           cause: error,
//         });
//       }
//     }),

//   createOrder: protectedProcedure
//     .input(
//       z.object({
//         products: z.array(
//           z.object({
//             productId: z.number().positive(),
//             quantity: z.number().positive(),
//             billAmount: z.number().positive(),
//             totalTaxes: z.number().positive(),
//             totalPrice: z.number().positive(),
//             shippingAddressId: z.number().positive(),
//             billingAddressId: z.number().positive(),
//           }),
//         ),
//       }),
//     )
//     .mutation(async ({ input, ctx }) => {
//       try {
//         // Take the first product's addresses (assuming all products go to same address)
//         const firstProduct = input.products[0];

//         // Calculate totals from all products
//         const totalPrice = input.products.reduce(
//           (sum, p) => sum + p.totalPrice,
//           0,
//         );
//         const totalTaxes = input.products.reduce(
//           (sum, p) => sum + p.totalTaxes,
//           0,
//         );
//         const billAmount = input.products.reduce(
//           (sum, p) => sum + p.billAmount,
//           0,
//         );

//         const order = await db.insert(orders).values({
//           userId: ctx.session.user.id,
//           status: "PENDING",
//           shippingAddressId: firstProduct!.shippingAddressId,
//           billingAddressId: firstProduct!.billingAddressId,
//           totalPrice,
//           totalTaxes,
//           billAmount,
//         });

//         return order;
//       } catch (error) {
//         throw new TRPCError({
//           code: "INTERNAL_SERVER_ERROR",
//           message: "Failed to create order",
//           cause: error,
//         });
//       }
//     }),

//   updateOrderStatus: protectedProcedure
//     .input(
//       z.object({
//         orderId: z.number().positive(),
//         status: z.enum(["PENDING", "SHIPPED", "DELIVERED"]),
//       }),
//     )
//     .mutation(async ({ input }) => {
//       try {
//         const order = await db.query.orders.findFirst({
//           where: eq(orders.id, input.orderId),
//         });

//         if (!order) {
//           throw new TRPCError({
//             code: "NOT_FOUND",
//             message: "Order not found",
//           });
//         }

//         await db
//           .update(orders)
//           .set({
//             status: input.status,
//           })
//           .where(eq(orders.id, input.orderId));

//         return order;
//       } catch (error) {
//         if (error instanceof TRPCError) throw error;
//         throw new TRPCError({
//           code: "INTERNAL_SERVER_ERROR",
//           message: "Failed to update order status",
//           cause: error,
//         });
//       }
//     }),

//   deleteOrderById: protectedProcedure
//     .input(z.number().positive())
//     .mutation(async ({ input }) => {
//       try {
//         const order = await db.query.orders.findFirst({
//           where: eq(orders.id, input),
//         });

//         if (!order) {
//           throw new TRPCError({
//             code: "NOT_FOUND",
//             message: "Order not found",
//           });
//         }

//         await db.delete(orders).where(eq(orders.id, input));

//         return order;
//       } catch (error) {
//         if (error instanceof TRPCError) throw error;
//         throw new TRPCError({
//           code: "INTERNAL_SERVER_ERROR",
//           message: "Failed to delete order",
//           cause: error,
//         });
//       }
//     }),

//   // cart related operations

//   addToCart: protectedProcedure
//     .input(
//       z.object({
//         productId: z.number().positive(),
//         quantity: z.number().positive(),
//       }),
//     )
//     .mutation(async ({ input, ctx }) => {
//       try {
//         // First check if product exists
//         const product = await db.query.products.findFirst({
//           where: eq(products.id, input.productId),
//         });

//         if (!product) {
//           throw new TRPCError({
//             code: "NOT_FOUND",
//             message: "Product not found",
//           });
//         }

//         // Check if user has a cart
//         let userCart = await db.query.carts.findFirst({
//           where: eq(carts.userId, ctx.session.user.id),
//         });

//         // If no cart exists, create one
//         if (!userCart) {
//           const newCart = await db
//             .insert(carts)
//             .values({
//               userId: ctx.session.user.id,
//             })
//             .returning();
//           userCart = newCart[0];
//         }

//         // Check if item already exists in cart
//         const cartItem = await db.query.cartItems.findFirst({
//           where: and(
//             eq(cartItems.cartId, userCart!.id),
//             eq(cartItems.productId, input.productId),
//           ),
//         });

//         if (cartItem) {
//           // Update quantity if item exists
//           await db
//             .update(cartItems)
//             .set({
//               quantity: cartItem.quantity + input.quantity,
//             })
//             .where(
//               and(
//                 eq(cartItems.cartId, userCart!.id),
//                 eq(cartItems.productId, input.productId),
//               ),
//             );
//         } else {
//           // Add new item if it doesn't exist
//           await db.insert(cartItems).values({
//             cartId: userCart!.id,
//             productId: input.productId,
//             quantity: input.quantity,
//             price: product.sellingPrice,
//           });
//         }

//         return product;
//       } catch (error) {
//         throw new TRPCError({
//           code: "INTERNAL_SERVER_ERROR",
//           message: "Failed to add to cart",
//           cause: error,
//         });
//       }
//     }),

//   removeFromCart: protectedProcedure
//     .input(
//       z.object({
//         productId: z.number().positive(),
//         quantity: z.number().positive(),
//       }),
//     )
//     .mutation(async ({ input, ctx }) => {
//       try {
//         const userCart = await db.query.carts.findFirst({
//           where: eq(carts.userId, ctx.session.user.id),
//         });

//         if (!userCart) {
//           throw new TRPCError({
//             code: "NOT_FOUND",
//             message: "Cart not found",
//           });
//         }

//         const cartItem = await db.query.cartItems.findFirst({
//           where: and(
//             eq(cartItems.cartId, userCart.id),
//             eq(cartItems.productId, input.productId),
//           ),
//         });

//         if (!cartItem) {
//           throw new TRPCError({
//             code: "NOT_FOUND",
//             message: "Item not found in cart",
//           });
//         }

//         const newQuantity = cartItem.quantity - input.quantity;

//         if (newQuantity <= 0) {
//           // Remove the item completely
//           await db
//             .delete(cartItems)
//             .where(
//               and(
//                 eq(cartItems.cartId, userCart.id),
//                 eq(cartItems.productId, input.productId),
//               ),
//             );

//           // Check if cart is empty
//           const remainingItems = await db.query.cartItems.findFirst({
//             where: eq(cartItems.cartId, userCart.id),
//           });

//           if (!remainingItems) {
//             // Delete the cart if no items left
//             await db.delete(carts).where(eq(carts.id, userCart.id));
//           }
//         } else {
//           // Update with new quantity
//           await db
//             .update(cartItems)
//             .set({
//               quantity: newQuantity,
//             })
//             .where(
//               and(
//                 eq(cartItems.cartId, userCart.id),
//                 eq(cartItems.productId, input.productId),
//               ),
//             );
//         }

//         return { success: true };
//       } catch (error) {
//         throw new TRPCError({
//           code: "INTERNAL_SERVER_ERROR",
//           message: "Failed to remove from cart",
//           cause: error,
//         });
//       }
//     }),
// });

// src/server/api/routers/order.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { orders, orderItems, payments } from "@/server/db/schema";

// Input validation schema for creating an order
const orderProductSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1),
  billAmount: z.number().min(0),
  totalTaxes: z.number().min(0),
  totalPrice: z.number().min(0),
  shippingAddressId: z.number(),
  billingAddressId: z.number(),
});

export const orderRouter = createTRPCRouter({
  // Create a new order
  createOrder: protectedProcedure
    .input(
      z.object({
        products: z.array(orderProductSchema),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { products } = input;
        const userId = ctx.session.user.id;

        // Calculate order totals
        const totalPrice = products.reduce((sum, p) => sum + p.totalPrice, 0);
        const totalTaxes = products.reduce((sum, p) => sum + p.totalTaxes, 0);
        const billAmount = products.reduce((sum, p) => sum + p.billAmount, 0);

        // Create the order
        const [newOrder] = await db
          .insert(orders)
          .values({
            userId,
            status: "PENDING",
            shippingAddressId: products[0]!.shippingAddressId,
            billingAddressId: products[0]!.billingAddressId,
            totalPrice,
            totalTaxes,
            billAmount,
          })
          .returning();

        if (!newOrder) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create order",
          });
        }

        // Create order items
        await db.insert(orderItems).values(
          products.map((product) => ({
            orderId: newOrder.id,
            productId: product.productId,
            quantity: product.quantity,
            price: (product.totalPrice / product.quantity).toString(), // Store unit price as string
          })),
        );

        return orders;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create order",
          cause: error,
        });
      }
    }),

  // Get all orders for the current user
  getUserOrders: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await db.query.orders.findMany({
        where: eq(orders.userId, ctx.session.user.id),
        with: {
          items: {
            with: {
              product: true,
            },
          },
          shippingAddress: true,
        },
        orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      });
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch orders",
        cause: error,
      });
    }
  }),

  // Get a specific order by ID
  getOrderById: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      try {
        const order = await db.query.orders.findFirst({
          where: eq(orders.id, input),
          with: {
            items: {
              with: {
                product: true,
              },
            },
            shippingAddress: true,
            // payment: true,
          },
        });

        if (!order || order.userId !== ctx.session.user.id) {
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

  // Record payment for an order
  recordPayment: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        paymentMethod: z.string(),
        paymentStatus: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const order = await db.query.orders.findFirst({
          where: eq(orders.id, input.orderId),
        });

        if (!order || order.userId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        // Record the payment
        const [payment] = await db
          .insert(payments)
          .values({
            orderId: input.orderId,
            paymentMethod: input.paymentMethod,
            paymentStatus: input.paymentStatus,
            paymentDate: new Date(),
          })
          .returning();

        // Update order status
        await db
          .update(orders)
          .set({
            status: input.paymentStatus === "success" ? "PAID" : "PENDING",
            updatedAt: new Date(),
          })
          .where(eq(orders.id, input.orderId));

        return payment;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to record payment",
          cause: error,
        });
      }
    }),
});
