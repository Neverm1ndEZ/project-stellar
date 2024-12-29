// app/(shop)/checkout/error/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CheckoutErrorPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="rounded-lg bg-red-50 p-8 text-center">
        <h2 className="mb-4 text-lg font-semibold text-red-800">
          Something went wrong!
        </h2>
        <p className="mb-6 text-red-600">
          An error occurred during checkout (payment failed, etc.).
        </p>
        <div className="flex justify-center space-x-4">
          <Button onClick={() => router.push("/cart")}>Return to Cart</Button>
          <Button variant="outline" onClick={() => router.push("/checkout")}>
            Try Checkout Again
          </Button>
        </div>
      </div>
    </div>
  );
}
