import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { addressRouter } from "./routers/address";
import { authRouter } from "./routers/auth";
import { cartRouter } from "./routers/cart";
import { orderRouter } from "./routers/orders";
import { productRouter } from "./routers/products";
import { checkoutRouter } from "./routers/checkout";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  order: orderRouter,
  product: productRouter,
  cart: cartRouter,
  address: addressRouter,
  checkout: checkoutRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
