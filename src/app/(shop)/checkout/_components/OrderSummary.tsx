// src/app/(shop)/checkout/_components/OrderSummary.tsx
"use client";

import { useMemo } from "react";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, HelpCircle } from "lucide-react";

interface OrderSummaryProps {
  selectedPaymentMethod?: "card" | "upi" | "cod";
  isSubmitting?: boolean;
  onSubmit: () => Promise<void>; // Add this prop
}

export function OrderSummary({
  selectedPaymentMethod,
  isSubmitting,
  onSubmit, // Use this prop
}: OrderSummaryProps) {
  const { items } = useCart();

  // Calculate all the order amounts using useMemo to avoid unnecessary recalculations
  const { subtotal, shipping, codCharge, gst, total } = useMemo(() => {
    // Calculate subtotal
    const subtotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    // Calculate shipping (free for orders above ₹500)
    const shipping = subtotal > 500 ? 0 : 50;

    // Calculate COD charges if applicable (₹50 for COD)
    const codCharge = selectedPaymentMethod === "cod" ? 50 : 0;

    // Calculate GST (5% for food items)
    const gst = subtotal * 0.05;

    // Calculate total
    const total = subtotal + shipping + codCharge + gst;

    return {
      subtotal,
      shipping,
      codCharge,
      gst,
      total,
    };
  }, [items, selectedPaymentMethod]);

  // Handle form submission
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent default form submission
    try {
      await onSubmit(); // Call the parent's submit handler
    } catch (error) {
      console.error("Payment submission error:", error);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Order Summary</span>
          <span className="text-sm font-normal text-gray-500">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Order Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div className="flex-1">
                <span className="font-medium">{item.product.name}</span>
                <div className="text-xs text-gray-500">
                  Quantity: {item.quantity}
                  {item.variant &&
                    ` - ${item.variant.variantName}: ${item.variant.variantValue}`}
                </div>
              </div>
              <span className="ml-4 font-medium">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Shipping</span>
            <span>
              {shipping === 0 ? (
                <span className="text-green-600">Free</span>
              ) : (
                formatCurrency(shipping)
              )}
            </span>
          </div>

          {selectedPaymentMethod === "cod" && (
            <div className="flex justify-between">
              <span className="flex items-center text-gray-500">
                COD Charge
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="ml-1 h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Additional charge for Cash on Delivery
                  </TooltipContent>
                </Tooltip>
              </span>
              <span>{formatCurrency(codCharge)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="flex items-center text-gray-500">
              GST (5%)
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="ml-1 h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent>5% GST applicable on food items</TooltipContent>
              </Tooltip>
            </span>
            <span>{formatCurrency(gst)}</span>
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>

        {/* Free Shipping Notice */}
        {subtotal < 500 && (
          <div className="rounded-md bg-green-50 p-3 text-center text-sm text-green-700">
            Add items worth {formatCurrency(500 - subtotal)} more for free
            shipping!
          </div>
        )}
      </CardContent>

      {/* The button is now controlled by the parent component */}
      <CardFooter>
        <Button
          className="w-full"
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </span>
          ) : (
            `Pay ${formatCurrency(total)}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};
