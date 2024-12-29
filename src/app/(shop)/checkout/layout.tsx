// src/app/(shop)/checkout/layout.tsx
import { type PropsWithChildren } from "react";

export default function CheckoutLayout({ children }: PropsWithChildren) {
  return (
    <div className="container py-8">
      <h1 className="mb-8 text-2xl font-bold">Checkout</h1>
      {children}
    </div>
  );
}
