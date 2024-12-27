// src/server/db/relations.ts
import { relations } from "drizzle-orm";
import {
  accounts,
  addresses,
  brands,
  cartItems,
  carts,
  categories,
  orderItems,
  orders,
  orderShipments,
  payments,
  productCategories,
  productImages,
  products,
  productVariants,
  promoCodes,
  reviews,
  roles,
  sessions,
  shippingMethods,
  usedPromoCodes,
  userRoles,
  users,
} from "./schema";

// User Management Relations
export const usersRelations = relations(users, ({ many }) => ({
  // One user can have many addresses
  addresses: many(addresses),
  // One user can have many carts (though typically one active cart)
  carts: many(carts),
  // One user can place many orders
  orders: many(orders),
  // One user can have many roles (many-to-many through userRoles)
  userRoles: many(userRoles),
  // One user can write many reviews
  reviews: many(reviews),
  // One user can use many promo codes
  usedPromoCodes: many(usedPromoCodes),
  // Add inside usersRelations
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  // One role can be assigned to many users (many-to-many through userRoles)
  userRoles: many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  // Each user-role assignment belongs to one user
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  // Each user-role assignment belongs to one role
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));

// Product Management Relations
export const productsRelations = relations(products, ({ many, one }) => ({
  // One product can have many variants
  variants: many(productVariants),
  // One product can have many images
  images: many(productImages),
  // One product can be in many cart items
  cartItems: many(cartItems),
  // One product can be in many order items
  orderItems: many(orderItems),
  // One product can belong to many categories (many-to-many through productCategories)
  productCategories: many(productCategories),
  // One product belongs to one brand
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  // One product can have many reviews
  reviews: many(reviews),
}));

// Categories with self-referencing for parent-child relationship
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  // Self-referencing: one category can be a parent of many categories
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "parentChild",
  }),
  children: many(categories, {
    relationName: "parentChild",
  }),
  // One category can have many products (many-to-many through productCategories)
  productCategories: many(productCategories),
}));

export const productCategoriesRelations = relations(
  productCategories,
  ({ one }) => ({
    product: one(products, {
      fields: [productCategories.productId],
      references: [products.id],
    }),
    category: one(categories, {
      fields: [productCategories.categoryId],
      references: [categories.id],
    }),
  }),
);

export const productVariantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    // Each variant belongs to one product
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    // One variant can be in many cart items
    cartItems: many(cartItems),
    // One variant can be in many order items
    orderItems: many(orderItems),
  }),
);

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

// Shopping Cart Relations
export const cartsRelations = relations(carts, ({ many, one }) => ({
  items: many(cartItems),
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [cartItems.variantId],
    references: [productVariants.id],
  }),
}));

// Order Management Relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  // Each order belongs to one user
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  // Each order has one shipping address
  shippingAddress: one(addresses, {
    fields: [orders.shippingAddressId],
    references: [addresses.id],
  }),
  // Each order has one optional billing address
  billingAddress: one(addresses, {
    fields: [orders.billingAddressId],
    references: [addresses.id],
  }),
  // One order can have many items
  items: many(orderItems),
  // One order can have many shipments
  shipments: many(orderShipments),
  // One order can have many payments
  payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}));

// Shipping and Payment Relations
export const shippingMethodsRelations = relations(
  shippingMethods,
  ({ many }) => ({
    shipments: many(orderShipments),
  }),
);

export const orderShipmentsRelations = relations(orderShipments, ({ one }) => ({
  order: one(orders, {
    fields: [orderShipments.orderId],
    references: [orders.id],
  }),
  shippingMethod: one(shippingMethods, {
    fields: [orderShipments.shippingMethodId],
    references: [shippingMethods.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

// Review Relations
export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

// Promotional Feature Relations
export const promoCodesRelations = relations(promoCodes, ({ many }) => ({
  usages: many(usedPromoCodes),
}));

export const usedPromoCodesRelations = relations(usedPromoCodes, ({ one }) => ({
  promoCode: one(promoCodes, {
    fields: [usedPromoCodes.promoCodeId],
    references: [promoCodes.id],
  }),
  user: one(users, {
    fields: [usedPromoCodes.userId],
    references: [users.id],
  }),
}));

// Address Relations
export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
}));

// Brand Relations
export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));
