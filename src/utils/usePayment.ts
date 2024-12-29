// src/hooks/usePayment.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { api } from "@/trpc/react";
import { useToast } from "@/hooks/use-toast";

export type PaymentMethod = "card" | "upi" | "cod";
export type PaymentStatus = "pending" | "processing" | "success" | "failed";

interface PaymentDetails {
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  upiId?: string;
}

interface PaymentOptions {
  method: PaymentMethod;
  shippingAddressId: number;
  billingAddressId: number;
  details?: PaymentDetails;
}

interface PaymentState {
  status: PaymentStatus;
  error: string | null;
}

export function usePayment() {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    status: "pending",
    error: null,
  });
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { toast } = useToast();

  // TRPC mutations with proper error handling
  const createOrder = api.order.createOrder.useMutation({
    onError: (error) => {
      toast({
        title: "Order Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const recordPayment = api.order.recordPayment.useMutation({
    onError: (error) => {
      toast({
        title: "Payment Recording Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const validatePaymentDetails = (
    method: PaymentMethod,
    details?: PaymentDetails,
  ): { isValid: boolean; error?: string } => {
    if (method === "cod") return { isValid: true };

    if (!details) {
      return { isValid: false, error: "Payment details are required" };
    }

    switch (method) {
      case "card":
        if (!details.cardNumber?.replace(/\s/g, "").length) {
          return { isValid: false, error: "Card number is required" };
        }
        if (details.cardNumber?.replace(/\s/g, "").length !== 16) {
          return { isValid: false, error: "Invalid card number" };
        }
        if (!details.expiryDate || details.expiryDate.length !== 5) {
          return { isValid: false, error: "Invalid expiry date" };
        }
        if (!details.cvv || details.cvv.length !== 3) {
          return { isValid: false, error: "Invalid CVV" };
        }
        return { isValid: true };

      case "upi":
        if (!details.upiId) {
          return { isValid: false, error: "UPI ID is required" };
        }
        if (!details.upiId.includes("@")) {
          return { isValid: false, error: "Invalid UPI ID format" };
        }
        return { isValid: true };

      default:
        return { isValid: false, error: "Invalid payment method" };
    }
  };

  const calculateTotalAmount = () => {
    const subtotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
    const shipping = subtotal > 500 ? 0 : 50;
    return subtotal + shipping;
  };

  const processPayment = async ({
    method,
    shippingAddressId,
    billingAddressId,
    details,
  }: PaymentOptions) => {
    if (paymentState.status === "processing") return;

    try {
      // Validate cart
      if (items.length === 0) {
        throw new Error("Your cart is empty");
      }

      // Validate payment details
      const validation = validatePaymentDetails(method, details);
      if (!validation.isValid) {
        throw new Error(validation.error || "Invalid payment details");
      }

      setPaymentState({ status: "processing", error: null });

      // Create order first
      const order = await createOrder.mutateAsync({
        products: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          billAmount: item.price * item.quantity,
          totalTaxes: 0,
          totalPrice: item.price * item.quantity,
          shippingAddressId,
          billingAddressId,
        })),
      });

      // Process payment based on method
      let paymentSuccess = false;
      try {
        switch (method) {
          case "card":
            // Simulate card payment processing
            await new Promise((resolve) => setTimeout(resolve, 1500));
            paymentSuccess = true;
            break;

          case "upi":
            // Simulate UPI payment processing
            await new Promise((resolve) => setTimeout(resolve, 1000));
            paymentSuccess = true;
            break;

          case "cod":
            paymentSuccess = true;
            break;
        }
      } catch (error) {
        console.error("Payment processing error:", error);
        throw new Error("Payment processing failed. Please try again.");
      }

      if (!paymentSuccess) {
        throw new Error("Payment could not be completed");
      }

      // Record successful payment
      await recordPayment.mutateAsync({
        orderId: Number(order.id),
        paymentMethod: method,
        paymentStatus: "success",
        amount: calculateTotalAmount(),
        metadata: {
          method,
          timestamp: new Date().toISOString(),
        },
      });

      setPaymentState({ status: "success", error: null });
      clearCart();
      toast({
        title: "Payment Successful!",
        description: "Your order has been placed successfully.",
        variant: "success",
      });
      router.push("/checkout/success");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setPaymentState({ status: "failed", error: errorMessage });
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Payment error:", error);
      // Only redirect on specific errors, not validation failures
      if (error instanceof Error && !error.message.includes("Invalid")) {
        router.push("/checkout/error");
      }
    }
  };

  const resetPaymentState = () => {
    setPaymentState({ status: "pending", error: null });
  };

  return {
    processPayment,
    paymentState,
    resetPaymentState,
  };
}

// src/hooks/usePayment.ts
export function usePayment() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { toast } = useToast();

  const createOrder = api.order.createOrder.useMutation({
    onError: (error) => {
      toast({
        title: "Order Creation Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error; // Re-throw to be caught by the payment handler
    },
  });

  const processPayment = async (paymentData) => {
    try {
      // First create the order
      const order = await createOrder.mutateAsync({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        ...paymentData,
      });

      // Process the payment based on the method
      const paymentResult = await handlePaymentByMethod(
        paymentData.method,
        order.id,
      );
      if (paymentResult.success) {
        clearCart();
        return { success: true, orderId: order.id };
      }

      throw new Error(paymentResult.error || "Payment failed");
    } catch (error) {
      console.error("Payment processing error:", error);
      throw error;
    }
  };

  return { processPayment };
}
