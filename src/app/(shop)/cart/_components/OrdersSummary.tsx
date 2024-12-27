// src/app/(shop)/cart/_components/OrderSummary.tsx
"use client";

import { useCart } from "@/store/cart";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShippingInfo } from "./ShippingInfo";

export function OrderSummary() {
  const { items, isLoading } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  const subtotal = items.reduce((total, item) => {
    const itemPrice = Number(item.price);
    return total + itemPrice;
  }, 0);

  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (!session) {
      router.push(`/login?from=${encodeURIComponent("/checkout")}`);
    } else {
      router.push("/checkout");
    }
  };

  const formatPrice = (price: number) =>
    price.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : `₹${formatPrice(shipping)}`}</span>
          </div>
          <div className="flex justify-between border-t pt-4 text-lg font-bold">
            <span>Total</span>
            <span>₹{formatPrice(total)}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleCheckout}
            className="w-full"
            disabled={isLoading}
          >
            {session ? "Proceed to Checkout" : "Sign in to Checkout"}
          </Button>
        </CardFooter>
      </Card>
      <ShippingInfo />
    </>
  );
}
