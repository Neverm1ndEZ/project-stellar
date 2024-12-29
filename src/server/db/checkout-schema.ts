// src/server/db/checkout-schema.ts
import { z } from "zod";

// Base schema for contact information
export const contactSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
});

// Schema for checkout address
export const checkoutAddressSchema = z.object({
  addressLineOne: z.string().min(5, "Please enter your complete address"),
  addressLineTwo: z.string().optional(),
  city: z.string().min(2, "Please enter your city"),
  state: z.string().min(2, "Please enter your state"),
  country: z.string().default("India"),
  postalCode: z.string().min(6, "Please enter a valid postal code"),
  type: z.enum(["shipping", "billing"]).default("shipping"),
});

// Schema for payment details
export const paymentDetailsSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("card"),
    cardNumber: z.string().min(16, "Invalid card number"),
    expiryDate: z.string().min(5, "Invalid expiry date"),
    cvv: z.string().min(3, "Invalid CVV"),
  }),
  z.object({
    method: z.literal("upi"),
    upiId: z.string().regex(/@/, "Invalid UPI ID"),
  }),
  z.object({
    method: z.literal("cod"),
  }),
]);

// Complete checkout schema
export const checkoutSchema = z.object({
  contact: contactSchema,
  address: checkoutAddressSchema,
  payment: paymentDetailsSchema,
});
