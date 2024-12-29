// src/app/(shop)/checkout/_components/CheckoutClient.tsx
"use client";

import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/store/cart";
import { usePayment, type PaymentMethod } from "@/hooks/usePayment";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckoutForm } from "./CheckoutForm";
import { OrderSummary } from "./OrderSummary";

export function CheckoutClient({ initialAddresses }) {
  const router = useRouter();
  const { items, isLoading } = useCart();
  const { processPayment } = usePayment();
  const { toast } = useToast();

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("card");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && items.length === 0) {
      router.push("/cart");
    }
  }, [items.length, isLoading, router]);

  const handlePayment = async (paymentData) => {
    setIsSubmitting(true);
    try {
      const result = await processPayment(paymentData);
      if (result.success) {
        router.push("/checkout/success");
      } else {
        throw new Error("Payment failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      router.push("/checkout/error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <CheckoutForm
        initialAddresses={initialAddresses}
        selectedPayment={selectedPayment}
        onPaymentMethodChange={setSelectedPayment}
        onSubmitPayment={handlePayment}
        isSubmitting={isSubmitting}
      />
      <OrderSummary
        selectedPaymentMethod={selectedPayment}
        isSubmitting={isSubmitting}
        onSubmit={async () => {
          const form = document.getElementById(
            "checkout-form",
          ) as HTMLFormElement;
          if (form) {
            form.dispatchEvent(new Event("submit", { cancelable: true }));
          }
        }}
      />
    </div>
  );
}
