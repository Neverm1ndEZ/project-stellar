// src/server/db/schema.ts
import {
  uuid,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  decimal,
  varchar,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import type { AdapterAccount } from "@auth/core/adapters";

// First, let's define our enums
export const orderStatus = pgEnum("order_status", [
  "PENDING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

// User Management Tables
export const users = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").unique().notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  password: text("password"),
  phoneNumber: varchar("phone_number", { length: 20 }),
  phoneVerified: boolean("phone_verified").default(false),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  role: varchar("role", { length: 50 }).default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});

// Add after users table
export const accounts = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const roles = pgTable("role", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: text("name").notNull().unique(),
});

export const userRoles = pgTable(
  "user_role",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.roleId] }),
  }),
);

// Product Management Tables
export const brands = pgTable("brand", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const categories = pgTable("category", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  parentId: integer("parent_id").references(() => categories.id),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("product", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  brandId: integer("brand_id").references(() => brands.id),
  name: text("name").notNull(),
  shortDesc: text("short_desc").notNull(),
  longDesc: text("long_desc").notNull(),
  originalPrice: decimal("original_price", {
    precision: 10,
    scale: 2,
  }).notNull(),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }).notNull(),
  sku: varchar("sku", { length: 50 }).notNull().unique(),
  availableQuantity: integer("available_quantity").notNull(),
  featureImage: text("feature_image").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const productCategories = pgTable(
  "product_category",
  {
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.productId, t.categoryId] }),
  }),
);

export const productImages = pgTable("product_image", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  altText: text("alt_text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const productVariants = pgTable("product_variant", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  variantName: text("variant_name").notNull(),
  variantValue: text("variant_value").notNull(),
  additionalPrice: decimal("additional_price", { precision: 10, scale: 2 }),
  availableQuantity: integer("available_quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews
export const reviews = pgTable("review", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating"),
  title: text("title").notNull(),
  detailedReview: text("detailed_review"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cart Management
export const carts = pgTable("cart", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cartItems = pgTable("cart_item", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  cartId: integer("cart_id")
    .notNull()
    .references(() => carts.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  variantId: integer("variant_id").references(() => productVariants.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Address Management
export const addresses = pgTable("address", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  addressLineOne: text("address_line_one").notNull(),
  addressLineTwo: text("address_line_two"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  country: text("country").notNull(),
  postalCode: text("postal_code").notNull(),
  type: text("type").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 6 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 6 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order Management
export const orders = pgTable("order", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  status: orderStatus("status").notNull().default("PENDING"),
  shippingAddressId: integer("shipping_address_id")
    .notNull()
    .references(() => addresses.id),
  billingAddressId: integer("billing_address_id").references(
    () => addresses.id,
  ),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  totalTaxes: decimal("total_taxes", { precision: 10, scale: 2 }),
  billAmount: decimal("bill_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_item", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  variantId: integer("variant_id").references(() => productVariants.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shipping and Payment
export const shippingMethods = pgTable("shipping_method", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: text("name").notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
});

export const orderShipments = pgTable("order_shipment", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  shippingMethodId: integer("shipping_method_id")
    .notNull()
    .references(() => shippingMethods.id),
  shippedDate: timestamp("shipped_date"),
  deliveredDate: timestamp("delivered_date"),
  trackingNumber: text("tracking_number"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payments = pgTable("payment", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Promotional Features
export const promoCodes = pgTable("promo_code", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  code: text("code").notNull().unique(),
  discountPercentage: decimal("discount_percentage", {
    precision: 5,
    scale: 2,
  }).notNull(),
  validFrom: timestamp("valid_from").notNull(),
  validTo: timestamp("valid_to").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usedPromoCodes = pgTable("used_promo_code", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  promoCodeId: integer("promo_code_id")
    .notNull()
    .references(() => promoCodes.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  usedAt: timestamp("used_at").notNull(),
});

// Export types for use in other parts of the application
// We now use separate types for select and insert operations
export type SelectUser = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;

export type SelectProduct = InferSelectModel<typeof products>;
export type InsertProduct = InferInsertModel<typeof products>;

export type SelectCategory = InferSelectModel<typeof categories>;
export type InsertCategory = InferInsertModel<typeof categories>;

export type SelectBrand = InferSelectModel<typeof brands>;
export type InsertBrand = InferInsertModel<typeof brands>;

export type SelectCart = InferSelectModel<typeof carts>;
export type InsertCart = InferInsertModel<typeof carts>;

export type SelectCartItem = InferSelectModel<typeof cartItems>;
export type InsertCartItem = InferInsertModel<typeof cartItems>;

export type SelectOrder = InferSelectModel<typeof orders>;
export type InsertOrder = InferInsertModel<typeof orders>;

export type SelectOrderItem = InferSelectModel<typeof orderItems>;
export type InsertOrderItem = InferInsertModel<typeof orderItems>;

export type SelectAddress = InferSelectModel<typeof addresses>;
export type InsertAddress = InferInsertModel<typeof addresses>;

export type SelectProductVariant = InferSelectModel<typeof productVariants>;
export type InsertProductVariant = InferInsertModel<typeof productVariants>;

export type SelectProductImage = InferSelectModel<typeof productImages>;
export type InsertProductImage = InferInsertModel<typeof productImages>;

export type SelectProductCategory = InferSelectModel<typeof productCategories>;
export type InsertProductCategory = InferInsertModel<typeof productCategories>;

export type SelectPromoCode = InferSelectModel<typeof promoCodes>;
export type InsertPromoCode = InferInsertModel<typeof promoCodes>;

export type SelectUsedPromoCode = InferSelectModel<typeof usedPromoCodes>;
export type InsertUsedPromoCode = InferInsertModel<typeof usedPromoCodes>;
