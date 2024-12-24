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
          throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
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
        const category = await db.query.categories.findFirst({
          where: eq(categories.id, input),
        });

        if (!category) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found",
          });
        }

        return await db.query.products.findMany({
          where: eq(products.categoryId, input),
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch products by category",
          cause: error,
        });
      }
    }),



  createProduct: protectedProcedure
    .input(productSchema)
    .mutation(async ({ input }) => {
      try {
        return await db.insert(products).values(input);
      } catch (error) {
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
});