// src/app/(shop)/checkout/_components/AddressForm.tsx
"use client";

import { type UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type z } from "zod";
import { type checkoutSchema } from "@/server/db/checkout-schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// India states list for the dropdown
const INDIA_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface AddressFormProps {
  form: UseFormReturn<CheckoutFormValues>;
}

export function AddressForm({ form }: AddressFormProps) {
  // Get form values for conditional validation
  const watchedState = form.watch("address.state");

  return (
    <div className="space-y-8">
      {/* Contact Information Section */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="contact.firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your first name"
                    {...field}
                    autoComplete="given-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact.lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your last name"
                    {...field}
                    autoComplete="family-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    {...field}
                    autoComplete="email"
                  />
                </FormControl>
                <FormDescription>
                  Order updates will be sent to this email
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact.phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="10-digit mobile number"
                    {...field}
                    autoComplete="tel"
                    onChange={(e) => {
                      // Allow only numbers and limit to 10 digits
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  For delivery updates via SMS/WhatsApp
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Shipping Address Section */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Delivery Address
        </h3>
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="address.addressLineOne"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="House/Flat No., Building Name, Street"
                    {...field}
                    autoComplete="address-line1"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address.addressLineTwo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Apartment, Suite, etc.
                  <span className="ml-1 text-sm text-gray-500">(Optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    {...field}
                    autoComplete="address-line2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your city"
                      {...field}
                      autoComplete="address-level2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INDIA_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PIN Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="6-digit PIN code"
                      {...field}
                      autoComplete="postal-code"
                      onChange={(e) => {
                        // Allow only numbers and limit to 6 digits
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value="India"
                      disabled
                      autoComplete="country-name"
                      className="bg-gray-50"
                    />
                  </FormControl>
                  <FormDescription>
                    Currently we only ship within India
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* Save Address Section - If needed */}
      <div>
        <FormField
          control={form.control}
          name="address.type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select address type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="shipping">Shipping</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                This helps us organize your saved addresses
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
