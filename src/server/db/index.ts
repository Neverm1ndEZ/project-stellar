// src/server/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";

// Import everything from both schema and relations
import * as schema from "./schema";
import * as relations from "./relations";

// Combine schema and relations into a single object
const dbSchema = { ...schema, ...relations };

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? postgres(env.DATABASE_URL);
if (env.NODE_ENV !== "production") globalForDb.conn = conn;

// Pass the combined schema to drizzle
export const db = drizzle(conn, { schema: dbSchema });
