// src/server/db/schemas/address.ts
import { z } from "zod";

// This schema matches our database structure and handles validation
export const newAddressSchema = z.object({
  addressLineOne: z.string().min(5, "Please enter your full address"),
  addressLineTwo: z.string().optional(),
  city: z.string().min(2, "Please enter your city"),
  state: z.string().min(2, "Please enter your state"),
  country: z.string().default("India"), // Since this is an Indian e-commerce site
  postalCode: z.string().min(6, "Please enter a valid postal code"),
  type: z.enum(["shipping", "billing"]).default("shipping"),
  // We'll get these from a geocoding service in the API
  longitude: z.number().default(0),
  latitude: z.number().default(0),
});

// Extended schema for checkout form that includes user contact details
export const checkoutAddressSchema = newAddressSchema.extend({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
});
