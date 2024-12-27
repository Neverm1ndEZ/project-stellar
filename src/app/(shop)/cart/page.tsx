// src/app/(shop)/cart/page.tsx
import { Suspense } from "react";
import { CartContent } from "./_components/CartContent";
import { CartSkeleton } from "./_components/CartSkeleton";

// Server Component - The main page component
export default function CartPage() {
  return (
    <Suspense fallback={<CartSkeleton />}>
      <CartContent />
    </Suspense>
  );
}
