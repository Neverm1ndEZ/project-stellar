// src/app/(shop)/cart/_components/CartContent.tsx
"use client";

import { useCart } from "@/store/cart";
import { useCartOperations } from "@/components/global/CartProvider";
import { CartSkeleton } from "./CartSkeleton";
import { EmptyCart } from "./EmptyCart";
import { CartItems } from "./CartItems";
import { OrderSummary } from "./OrdersSummary";

export function CartContent() {
  const { items, isLoading, error } = useCart();
  const { syncWithServer } = useCartOperations();

  if (isLoading) {
    return <CartSkeleton />;
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <p>{error}</p>
          <button
            onClick={() => syncWithServer()}
            className="mt-2 text-sm font-medium hover:underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-2xl font-bold">Shopping Cart</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <CartItems />
        </div>
        <div>
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
