"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/store/cart";
import { api } from "@/trpc/server";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Form schema for new address
const newAddressSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Please enter your full address"),
  city: z.string().min(2, "Please enter your city"),
  state: z.string().min(2, "Please enter your state"),
  pincode: z.string().min(6, "Please enter a valid pincode"),
});

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedAddress, setSelectedAddress] = useState<string>("new");
  const [selectedPayment, setSelectedPayment] = useState<string>("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const { items, clearCart } = useCart();

  // Fetch user's saved addresses
  const { data: addresses } = api.address.getUserAddresses.useQuery(undefined, {
    enabled: !!session,
  });

  // Calculate order totals
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  // Form for new address
  const form = useForm<z.infer<typeof newAddressSchema>>({
    resolver: zodResolver(newAddressSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  const handlePayment = async (values?: z.infer<typeof newAddressSchema>) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // If using a new address, create it first
      let shippingAddressId = selectedAddress;
      if (selectedAddress === "new" && values) {
        const newAddress = await api.address.createAddress.mutate({
          ...values,
          type: "shipping",
        });
        shippingAddressId = newAddress.id.toString();
      }

      // Create the order
      const order = await api.order.createOrder.mutate({
        products: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          billAmount: item.price * item.quantity,
          totalTaxes: 0, // Calculate taxes if needed
          totalPrice: item.price * item.quantity,
          shippingAddressId: parseInt(shippingAddressId),
          billingAddressId: parseInt(shippingAddressId), // Use same address for billing
        })),
      });

      // Handle payment based on selected method
      switch (selectedPayment) {
        case "card":
          // Simulate card payment processing
          await new Promise((resolve) => setTimeout(resolve, 1500));
          break;
        case "upi":
          // Simulate UPI payment processing
          await new Promise((resolve) => setTimeout(resolve, 1000));
          break;
        case "cod":
          // No payment processing needed for COD
          break;
      }

      // Clear cart and redirect to success page
      clearCart();
      router.push("/checkout/success");
    } catch (error) {
      console.error("Checkout error:", error);
      router.push("/checkout/error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (values: z.infer<typeof newAddressSchema>) => {
    handlePayment(values);
  };

  // If no items in cart, redirect to cart page
  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-2xl font-bold">Checkout</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Shipping Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              {addresses && addresses.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-4 font-medium">Select Saved Address</h3>
                  <RadioGroup
                    value={selectedAddress}
                    onValueChange={setSelectedAddress}
                    className="space-y-3"
                  >
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={address.id.toString()}
                          id={`address-${address.id}`}
                        />
                        <label
                          htmlFor={`address-${address.id}`}
                          className="text-sm"
                        >
                          {address.addressLineOne}, {address.city},{" "}
                          {address.state} - {address.postalCode}
                        </label>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="new" id="address-new" />
                      <label htmlFor="address-new" className="text-sm">
                        Add New Address
                      </label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {selectedAddress === "new" && (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="pincode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pincode</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedPayment}
                onValueChange={setSelectedPayment}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="payment-card" />
                  <label htmlFor="payment-card">Credit/Debit Card</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upi" id="payment-upi" />
                  <label htmlFor="payment-upi">UPI</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cod" id="payment-cod" />
                  <label htmlFor="payment-cod">Cash on Delivery</label>
                </div>
              </RadioGroup>

              {selectedPayment === "card" && (
                <div className="mt-4 space-y-4">
                  <Input placeholder="Card Number" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="MM/YY" />
                    <Input placeholder="CVV" type="password" />
                  </div>
                </div>
              )}

              {selectedPayment === "upi" && (
                <div className="mt-4">
                  <Input placeholder="Enter UPI ID" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.name} ({item.quantity}x)
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between pt-2 text-lg font-bold">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                disabled={isProcessing}
                onClick={() => selectedAddress !== "new" && handlePayment()}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  `Pay ₹${total}`
                )}
              </Button>
            </CardFooter>
          </Card>

          <div className="mt-6 space-y-4">
            <div className="flex items-center text-sm text-gray-600">
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Free shipping on orders above ₹500
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Secure checkout process
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
