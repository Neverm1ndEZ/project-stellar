"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useCart } from "@/store/cart";

interface OrderSummaryProps {
  buttonText: string;
  onButtonClick: () => void;
  disabled?: boolean;
}

export function OrderSummary({
  buttonText,
  onButtonClick,
  disabled,
}: OrderSummaryProps) {
  const cart = useCart();
  const { items } = cart;
  const summary = cart.getCartMetadata();

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Cart Items Summary */}
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium">₹{item?.price?.toFixed(2)}</p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>₹{summary.subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Shipping</span>
            <span>
              {summary.shipping === 0
                ? "Free"
                : `₹${summary.shipping.toFixed(2)}`}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">GST (18%)</span>
            <span>₹{summary.tax.toFixed(2)}</span>
          </div>

          {summary.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-₹{summary.discount.toFixed(2)}</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>₹{summary.total.toFixed(2)}</span>
          </div>
        </div>

        {summary.shipping === 0 && (
          <div className="rounded-lg bg-green-50 p-3 text-center text-sm text-green-600">
            You got free shipping!
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button className="w-full" onClick={onButtonClick} disabled={disabled}>
          {disabled && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
