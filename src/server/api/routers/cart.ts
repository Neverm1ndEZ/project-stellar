// src/server/api/routers/cart.ts
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { db } from "@/server/db";
import {
  cartItems,
  carts,
  products,
  productVariants,
  type InsertCartItem,
} from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq, sql, gt, inArray } from "drizzle-orm";
import { z } from "zod";

// Define strong input validation schemas
const CartItemSchema = z.object({
  productId: z.number().positive(),
  variantId: z.number().positive().nullable().optional(),
  quantity: z.number().min(1).max(99),
});

const BulkCartItemSchema = z.array(CartItemSchema).min(1).max(50);

// Enhanced response interfaces with additional metadata
interface CartItemProduct {
  id: number;
  name: string;
  featureImage: string | null;
  shortDesc: string | null;
  sellingPrice: number;
  originalPrice: number;
  availableQuantity: number;
  maxPurchaseQuantity?: number;
}

interface CartItemVariant {
  id: number;
  variantName: string;
  variantValue: string;
  additionalPrice: number;
  availableQuantity: number;
}

interface TransformedCartItem {
  id: number;
  productId: number;
  variantId: number | null;
  quantity: number;
  price: number;
  originalPrice: number;
  product: CartItemProduct;
  variant: CartItemVariant | null;
  isAvailable: boolean;
  maxQuantityReached: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CartMetadata {
  itemCount: number;
  uniqueItemCount: number;
  subtotal: number;
  originalSubtotal: number;
  totalSavings: number;
  hasUnavailableItems: boolean;
  lastUpdated: Date;
}

interface CartResponse {
  items: TransformedCartItem[];
  metadata: CartMetadata;
}

// Utility functions for cart operations
const calculateCartMetadata = (items: TransformedCartItem[]): CartMetadata => {
  const metadata: CartMetadata = {
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    uniqueItemCount: items.length,
    subtotal: items.reduce((sum, item) => sum + item.price, 0),
    originalSubtotal: items.reduce((sum, item) => sum + item.originalPrice, 0),
    totalSavings: 0,
    hasUnavailableItems: items.some((item) => !item.isAvailable),
    lastUpdated: items.reduce(
      (latest, item) => (item.updatedAt > latest ? item.updatedAt : latest),
      new Date(0),
    ),
  };

  metadata.totalSavings = metadata.originalSubtotal - metadata.subtotal;
  return metadata;
};

// Enhanced cart router with comprehensive error handling and optimization
export const cartRouter = createTRPCRouter({
  // Get cart with detailed product information and metadata
  getCart: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await db.transaction(async (tx) => {
        // Clean up expired carts first (older than 30 days)
        await tx
          .delete(carts)
          .where(
            and(
              sql`${carts.updatedAt} < NOW() - INTERVAL '30 days'`,
              eq(carts.userId, ctx.session.user.id),
            ),
          );

        // Get or create cart with all related data in a single query
        const cart = await tx.query.carts.findFirst({
          where: eq(carts.userId, ctx.session.user.id),
          with: {
            items: {
              with: {
                product: true, // Get all product fields for validation
                variant: true, // Get all variant fields for validation
              },
            },
          },
        });

        if (!cart) {
          const [newCart] = await tx
            .insert(carts)
            .values({
              userId: ctx.session.user.id,
            })
            .returning();

          return {
            items: [],
            metadata: calculateCartMetadata([]),
          };
        }

        // Transform and validate each cart item
        const transformedItems = cart.items.map((item): TransformedCartItem => {
          const isAvailable = item.product.availableQuantity > 0;
          const maxQuantityReached =
            item.quantity >= item.product.availableQuantity;

          return {
            id: item.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            originalPrice: item.product.originalPrice * item.quantity,
            product: {
              id: item.product.id,
              name: item.product.name,
              featureImage: item.product.featureImage,
              shortDesc: item.product.shortDesc,
              sellingPrice: item.product.sellingPrice,
              originalPrice: item.product.originalPrice,
              availableQuantity: item.product.availableQuantity,
              maxPurchaseQuantity: item.product.availableQuantity,
            },
            variant: item.variant
              ? {
                  id: item.variant.id,
                  variantName: item.variant.variantName,
                  variantValue: item.variant.variantValue,
                  additionalPrice: item.variant.additionalPrice ?? 0,
                  availableQuantity: item.variant.availableQuantity,
                }
              : null,
            isAvailable,
            maxQuantityReached,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          };
        });

        return {
          items: transformedItems,
          metadata: calculateCartMetadata(transformedItems),
        } satisfies CartResponse;
      });
    } catch (error) {
      console.error("Cart fetch error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch cart",
        cause: error,
      });
    }
  }),

  // Add multiple items to cart in a single transaction
  addItems: protectedProcedure
    .input(BulkCartItemSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await db.transaction(async (tx) => {
          // Get or create cart
          let cart = await tx.query.carts.findFirst({
            where: eq(carts.userId, ctx.session.user.id),
          });

          if (!cart) {
            const [newCart] = await tx
              .insert(carts)
              .values({
                userId: ctx.session.user.id,
              })
              .returning();
            cart = newCart;
          }

          // Fetch all products and variants in a single query
          const productIds = input.map((item) => item.productId);
          const variantIds = input
            .map((item) => item.variantId)
            .filter((id): id is number => id != null);

          const [products, variants] = await Promise.all([
            tx.query.products.findMany({
              where: inArray(products.id, productIds),
            }),
            variantIds.length > 0
              ? tx.query.productVariants.findMany({
                  where: inArray(productVariants.id, variantIds),
                })
              : Promise.resolve([]),
          ]);

          // Prepare all cart items
          const cartItemsToAdd: InsertCartItem[] = [];

          for (const item of input) {
            const product = products.find((p) => p.id === item.productId);
            if (!product) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: `Product ${item.productId} not found`,
              });
            }

            // Validate inventory
            if (
              !product.availableQuantity ||
              product.availableQuantity < item.quantity
            ) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Insufficient quantity for product ${product.name}`,
              });
            }

            let finalPrice = product.sellingPrice;
            if (item.variantId) {
              const variant = variants.find((v) => v.id === item.variantId);
              if (!variant) {
                throw new TRPCError({
                  code: "NOT_FOUND",
                  message: `Variant ${item.variantId} not found`,
                });
              }
              finalPrice += variant.additionalPrice ?? 0;
            }

            cartItemsToAdd.push({
              cartId: cart.id,
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: finalPrice * item.quantity,
            });
          }

          // Bulk insert all items
          const newItems = await tx
            .insert(cartItems)
            .values(cartItemsToAdd)
            .returning();

          return newItems;
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error("Add to cart error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add items to cart",
          cause: error,
        });
      }
    }),

  // Add single item to cart with inventory validation
  // Add single item to cart with improved inventory validation and merge handling
  addToCart: protectedProcedure
    .input(CartItemSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await db.transaction(async (tx) => {
          // First, get or create the user's cart with a single query
          // We'll fetch related items to check for existing products
          let cart = await tx.query.carts.findFirst({
            where: eq(carts.userId, ctx.session.user.id),
            with: {
              items: {
                where: and(
                  eq(cartItems.productId, input.productId),
                  input.variantId
                    ? eq(cartItems.variantId, input.variantId)
                    : eq(cartItems.variantId, null),
                ),
                with: {
                  product: true,
                  variant: true,
                },
              },
            },
          });

          // If no cart exists, create one
          if (!cart) {
            const [newCart] = await tx
              .insert(carts)
              .values({
                userId: ctx.session.user.id,
              })
              .returning();
            cart = {
              ...newCart,
              items: [],
            };
          }

          // Get product with variant in a single query for inventory check
          const product = await tx.query.products.findFirst({
            where: eq(products.id, input.productId),
            with: {
              variants: input.variantId
                ? {
                    where: eq(productVariants.id, input.variantId),
                  }
                : undefined,
            },
          });

          if (!product) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Product not found or has been removed",
            });
          }

          // Calculate the final price including variant adjustments
          let finalPrice = product.sellingPrice;
          let availableQuantity = product.availableQuantity;

          // Handle variant-specific logic
          if (input.variantId) {
            const variant = product.variants?.[0];
            if (!variant) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Selected variant not found or has been removed",
              });
            }
            finalPrice += variant.additionalPrice ?? 0;
            availableQuantity = Math.min(
              availableQuantity,
              variant.availableQuantity,
            );
          }

          // Check for existing cart item and handle quantity updates
          const existingItem = cart.items[0]; // We filtered items above, so first item if it exists
          if (existingItem) {
            // Calculate new quantity and validate against inventory
            const newQuantity = existingItem.quantity + input.quantity;

            // Add a buffer for concurrent operations
            if (newQuantity > availableQuantity - 1) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Only ${availableQuantity} items available in stock`,
              });
            }

            // Update existing item with proper locking
            const [updatedItem] = await tx
              .update(cartItems)
              .set({
                quantity: newQuantity,
                price: finalPrice * newQuantity, // Recalculate total price
                updatedAt: new Date(),
              })
              .where(eq(cartItems.id, existingItem.id))
              .returning();

            return {
              ...updatedItem,
              product: {
                name: product.name,
                featureImage: product.featureImage,
                shortDesc: product.shortDesc,
                sellingPrice: product.sellingPrice,
                originalPrice: product.originalPrice,
                availableQuantity,
              },
              variant: product.variants?.[0] ?? null,
            };
          }

          // For new items, validate inventory
          if (input.quantity > availableQuantity) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Cannot add ${input.quantity} items. Only ${availableQuantity} available in stock`,
            });
          }

          // Add new item to cart
          const [newItem] = await tx
            .insert(cartItems)
            .values({
              cartId: cart.id,
              productId: input.productId,
              variantId: input.variantId,
              quantity: input.quantity,
              price: finalPrice * input.quantity,
            })
            .returning();

          // Return the new item with product details for the client
          return {
            ...newItem,
            product: {
              name: product.name,
              featureImage: product.featureImage,
              shortDesc: product.shortDesc,
              sellingPrice: product.sellingPrice,
              originalPrice: product.originalPrice,
              availableQuantity,
            },
            variant: product.variants?.[0] ?? null,
          };
        });
      } catch (error) {
        // Handle specific error cases
        if (error instanceof TRPCError) {
          throw error;
        }

        // Log unexpected errors but don't expose internals to client
        console.error("Add to cart error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add item to cart. Please try again.",
        });
      }
    }),

  // Remove items from cart with quantity management
  removeFromCart: protectedProcedure
    .input(
      z.object({
        productId: z.number().positive(),
        quantity: z.number().min(0), // Changed from positive() to min(0)
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        return await db.transaction(async (tx) => {
          // Get the cart with the specific item for atomic updates
          const cart = await tx.query.carts.findFirst({
            where: eq(carts.userId, ctx.session.user.id),
            with: {
              items: {
                where: eq(cartItems.productId, input.productId),
              },
            },
          });

          if (!cart) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Cart not found",
            });
          }

          const cartItem = cart.items[0];
          if (!cartItem) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Item not found in cart",
            });
          }

          const newQuantity = cartItem.quantity - input.quantity;

          // If new quantity would be 0 or less, remove the item
          if (newQuantity <= 0) {
            await tx.delete(cartItems).where(eq(cartItems.id, cartItem.id));

            // Check if cart is now empty
            const remainingItems = await tx
              .select({ count: sql<number>`count(*)` })
              .from(cartItems)
              .where(eq(cartItems.cartId, cart.id));

            if (remainingItems[0].count === 0) {
              await tx.delete(carts).where(eq(carts.id, cart.id));
            }

            return {
              success: true,
              removed: true,
              newQuantity: 0,
            };
          }

          // Otherwise update the quantity
          const [updatedItem] = await tx
            .update(cartItems)
            .set({
              quantity: newQuantity,
              price: sql`(${cartItems.price} / ${cartItems.quantity}) * ${newQuantity}`, // Recalculate price based on unit price
            })
            .where(eq(cartItems.id, cartItem.id))
            .returning();

          return {
            success: true,
            removed: false,
            newQuantity: updatedItem.quantity,
          };
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error("Remove from cart error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update cart item",
          cause: error,
        });
      }
    }),

  // Update cart item quantities with inventory validation
  updateQuantities: protectedProcedure
    .input(
      z
        .array(
          z.object({
            itemId: z.number(),
            quantity: z.number().min(1).max(99),
          }),
        )
        .min(1),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await db.transaction(async (tx) => {
          const cart = await tx.query.carts.findFirst({
            where: eq(carts.userId, ctx.session.user.id),
            with: {
              items: {
                where: inArray(
                  cartItems.id,
                  input.map((item) => item.itemId),
                ),
                with: {
                  product: true,
                  variant: true,
                },
              },
            },
          });

          if (!cart) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Cart not found",
            });
          }

          // Update quantities with inventory validation
          const updates = await Promise.all(
            input.map(async ({ itemId, quantity }) => {
              const item = cart.items.find((i) => i.id === itemId);
              if (!item) {
                throw new TRPCError({
                  code: "NOT_FOUND",
                  message: `Cart item ${itemId} not found`,
                });
              }

              // Validate inventory
              const availableQuantity = item.variant
                ? item.variant.availableQuantity
                : item.product.availableQuantity;

              if (!availableQuantity || quantity > availableQuantity) {
                throw new TRPCError({
                  code: "BAD_REQUEST",
                  message: `Insufficient inventory for ${item.product.name}`,
                });
              }

              // Calculate price
              const unitPrice = item.variant
                ? item.product.sellingPrice +
                  (item.variant.additionalPrice ?? 0)
                : item.product.sellingPrice;

              return tx
                .update(cartItems)
                .set({
                  quantity,
                  price: unitPrice * quantity,
                  updatedAt: new Date(),
                })
                .where(eq(cartItems.id, itemId))
                .returning();
            }),
          );

          return updates.flat();
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error("Update quantities error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update cart quantities",
          cause: error,
        });
      }
    }),

  // Clear the entire cart
  clearCart: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await db.transaction(async (tx) => {
        const cart = await tx.query.carts.findFirst({
          where: eq(carts.userId, ctx.session.user.id),
        });

        if (cart) {
          await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));

          await tx.delete(carts).where(eq(carts.id, cart.id));
        }
      });

      return { success: true };
    } catch (error) {
      console.error("Clear cart error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to clear cart",
        cause: error,
      });
    }
  }),

  // Validate cart inventory and return updated availability
  validateInventory: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await db.transaction(async (tx) => {
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

        if (!cart) {
          return {
            isValid: true,
            invalidItems: [],
            metadata: calculateCartMetadata([]),
          };
        }

        const invalidItems = cart.items.filter((item) => {
          const availableQuantity = item.variant
            ? item.variant.availableQuantity
            : item.product.availableQuantity;

          return !availableQuantity || item.quantity > availableQuantity;
        });

        const transformedItems = cart.items.map((item): TransformedCartItem => {
          const availableQuantity = item.variant
            ? item.variant.availableQuantity
            : item.product.availableQuantity;

          const isAvailable = availableQuantity > 0;
          const maxQuantityReached = item.quantity >= availableQuantity;

          return {
            id: item.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            originalPrice: item.product.originalPrice * item.quantity,
            product: {
              id: item.product.id,
              name: item.product.name,
              featureImage: item.product.featureImage,
              shortDesc: item.product.shortDesc,
              sellingPrice: item.product.sellingPrice,
              originalPrice: item.product.originalPrice,
              availableQuantity: item.product.availableQuantity,
              maxPurchaseQuantity: availableQuantity,
            },
            variant: item.variant
              ? {
                  id: item.variant.id,
                  variantName: item.variant.variantName,
                  variantValue: item.variant.variantValue,
                  additionalPrice: item.variant.additionalPrice ?? 0,
                  availableQuantity: item.variant.availableQuantity,
                }
              : null,
            isAvailable,
            maxQuantityReached,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          };
        });

        return {
          isValid: invalidItems.length === 0,
          invalidItems: invalidItems.map((item) => ({
            itemId: item.id,
            productName: item.product.name,
            requestedQuantity: item.quantity,
            availableQuantity: item.variant
              ? item.variant.availableQuantity
              : item.product.availableQuantity,
          })),
          metadata: calculateCartMetadata(transformedItems),
        };
      });
    } catch (error) {
      console.error("Validate inventory error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to validate cart inventory",
        cause: error,
      });
    }
  }),
});
