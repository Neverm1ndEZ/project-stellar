// src/hooks/usePayment.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { api } from "@/trpc/server";

interface PaymentOptions {
  method: "card" | "upi" | "cod";
  shippingAddressId: number;
  billingAddressId: number;
}

export function usePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { items, clearCart } = useCart();

  // TRPC mutations
  const createOrder = api.order.createOrder.useMutation();
  const recordPayment = api.order.recordPayment.useMutation();

  const processPayment = async ({
    method,
    shippingAddressId,
    billingAddressId,
  }: PaymentOptions) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // Create the order first
      const order = await createOrder.mutateAsync({
        products: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          billAmount: item.price * item.quantity,
          totalTaxes: 0, // Calculate taxes if needed
          totalPrice: item.price * item.quantity,
          shippingAddressId,
          billingAddressId,
        })),
      });

      // Simulate different payment methods
      let paymentSuccess = true;
      switch (method) {
        case "card":
          // Simulate card payment processing
          await new Promise((resolve) => setTimeout(resolve, 1500));
          // In real app, integrate with payment gateway here
          break;

        case "upi":
          // Simulate UPI payment processing
          await new Promise((resolve) => setTimeout(resolve, 1000));
          // In real app, integrate with UPI provider here
          break;

        case "cod":
          // No payment processing needed for COD
          break;
      }

      // Record the payment result
      await recordPayment.mutateAsync({
        orderId: order.id,
        paymentMethod: method,
        paymentStatus: paymentSuccess ? "success" : "failed",
      });

      // Clear cart and redirect on success
      if (paymentSuccess) {
        clearCart();
        router.push("/checkout/success");
      } else {
        router.push("/checkout/error");
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      router.push("/checkout/error");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processPayment,
    isProcessing,
  };
}
