import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { categories, products } from "@/server/db/schema";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Schema definitions remain the same
const categorySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
});

const productSchema = z.object({
  brandId: z.number().positive().optional(),
  categoryId: z.number().positive().optional(),
  name: z.string().min(1).max(255),
  shortDesc: z.string().min(1).max(500),
  longDesc: z.string().min(1),
  originalPrice: z.number().positive(),
  sellingPrice: z.number().positive(),
  sku: z.string().min(1).max(50),
  availableQuantity: z.number().min(0),
  featureImage: z.string().url(),
});

export const productRouter = createTRPCRouter({
  getAllProducts: publicProcedure.query(async () => {
    try {
      return await db.query.products.findMany();
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch products",
        cause: error,
      });
    }
  }),

  getProductById: publicProcedure
    .input(z.number().positive())
    .query(async ({ input }) => {
      try {
        const product = await db.query.products.findFirst({
          where: eq(products.id, input),
        });

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        return product;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch product",
          cause: error,
        });
      }
    }),

  getCategoryById: publicProcedure
    .input(z.number().positive())
    .query(async ({ input }) => {
      try {
        const category = await db.query.categories.findFirst({
          where: eq(categories.id, input),
        });

        if (!category) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found",
          });
        }

        return category;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch category",
          cause: error,
        });
      }
    }),

  getAllCategories: publicProcedure.query(async () => {
    try {
      return await db.query.categories.findMany();
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch categories",
        cause: error,
      });
    }
  }),

  getProductByCategory: publicProcedure
    .input(z.number().positive())
    .query(async ({ input }) => {
      try {
        // First, verify the category exists
        const category = await db.query.categories.findFirst({
          where: eq(categories.id, input),
          // Use relations to get associated products
          with: {
            productCategories: {
              with: {
                product: true,
              },
            },
          },
        });

        if (!category) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Category with ID ${input} not found`,
          });
        }

        // Transform the result to return just the products
        const categoryProducts = category.productCategories
          .map((pc) => pc.product)
          .filter(
            (product): product is NonNullable<typeof product> =>
              product !== null,
          );

        return categoryProducts;
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error("Error fetching products by category:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch products by category",
          cause: error,
        });
      }
    }),

  createProduct: protectedProcedure
    .input(
      productSchema.and(
        z.object({
          categories: z.array(z.number().positive()).optional(),
        }),
      ),
    )
    .mutation(async ({ input }) => {
      try {
        const { categories: categoryIds, ...productData } = input;

        // Start a transaction to ensure data consistency
        return await db.transaction(async (tx) => {
          // Insert the product first
          const [newProduct] = await tx
            .insert(products)
            .values(productData)
            .returning();

          // If categories were provided, create the relationships
          if (categoryIds?.length) {
            await tx.insert(productCategories).values(
              categoryIds.map((categoryId) => ({
                productId: newProduct.id,
                categoryId,
              })),
            );
          }

          return newProduct;
        });
      } catch (error) {
        console.error("Error creating product:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create product",
          cause: error,
        });
      }
    }),

  createCategory: protectedProcedure
    .input(categorySchema)
    .mutation(async ({ input }) => {
      try {
        return await db.insert(categories).values(input);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create category",
          cause: error,
        });
      }
    }),

  getInventory: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const product = await ctx.db.query.products.findFirst({
          where: eq(products.id, input.productId),
          columns: {
            id: true,
            availableQuantity: true,
          },
        });

        if (!product) {
          throw new Error("Product not found");
        }

        return {
          availableQuantity: product.availableQuantity ?? 0,
        };
      } catch (error) {
        console.error("Error fetching inventory:", error);
        throw error;
      }
    }),
});
