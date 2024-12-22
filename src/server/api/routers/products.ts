import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { products } from "@/server/db/schema";
import { db } from "@/server/db";

export const productRouter = createTRPCRouter({
    getAll: publicProcedure.query(async () => {
        return db.query.products.findMany();
      }),
});
