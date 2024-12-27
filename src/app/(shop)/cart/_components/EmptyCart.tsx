import { Button } from "@/components/ui/button";
import Link from "next/link";

// src/app/(shop)/cart/_components/EmptyCart.tsx
export function EmptyCart() {
  return (
    <div className="container py-32 text-center">
      <h2 className="mb-4 text-2xl font-bold">Your cart is empty</h2>
      <p className="mb-8 text-gray-600">
        Add some delicious pickles to your cart!
      </p>
      <Link href="/products">
        <Button>Browse Products</Button>
      </Link>
    </div>
  );
}
