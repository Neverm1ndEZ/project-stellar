// src/hooks/useCheckout.ts
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/store/cart";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

// Type definitions for checkout flow
export type CheckoutStep = "address" | "payment" | "confirmation";
export type PaymentMethod = "card" | "upi" | "cod";
// export type AddressType = "shipping" | "billing";
export type AddressType = "shipping";

// Interface definitions for better type safety
interface CheckoutAddresses {
  shipping: number;
  // billing: number;
}

interface PaymentDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  upiId: string;
}

interface CheckoutState {
  currentStep: CheckoutStep;
  paymentMethod: PaymentMethod;
  addresses: CheckoutAddresses;
  paymentDetails: PaymentDetails;
}

export function useCheckout() {
  const router = useRouter();
  const { toast } = useToast();
  const cart = useCart();

  // Initialize state with proper typing
  const [state, setState] = useState<CheckoutState>({
    currentStep: "address",
    paymentMethod: "card",
    addresses: {
      shipping: 0,
      // billing: 0,
    },
    paymentDetails: {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      upiId: "",
    },
  });

  // State for processing and errors
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize checkout mutation with proper error handling
  const initCheckout = api.checkout.initializeCheckout.useMutation({
    onSuccess: () => {
      setErrors({});
      setState((prev) => ({ ...prev, currentStep: "payment" }));
      toast({
        title: "Proceeding to Payment",
        description: "Please select your preferred payment method.",
      });
    },
    onError: (error) => {
      setErrors({ checkout: error.message });
      toast({
        title: "Checkout Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Process payment mutation with error handling
  const processCheckout = api.checkout.processPayment.useMutation({
    onSuccess: (data) => {
      cart.clearCart();
      router.push(`/checkout/success?orderId=${data.orderId}`);
      toast({
        title: "Order Placed Successfully!",
        description: "Thank you for your purchase.",
      });
    },
    onError: (error) => {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      router.push("/checkout/error");
    },
  });

  // Validation functions for each step
  const validateAddressStep = useCallback(() => {
    const stepErrors: Record<string, string> = {};

    if (!state.addresses.shipping) {
      stepErrors.shipping = "Please select a shipping address";
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }, [state.addresses]);

  const validatePaymentStep = useCallback(() => {
    const stepErrors: Record<string, string> = {};

    if (state.paymentMethod === "card") {
      if (!(/^\d{16}$/.exec(state.paymentDetails.cardNumber))) {
        stepErrors.cardNumber = "Please enter a valid 16-digit card number";
      }
      if (
        !(/^(0[1-9]|1[0-2])\/([0-9]{2})$/.exec(state.paymentDetails.expiryDate))
      ) {
        stepErrors.expiryDate = "Please enter a valid expiry date (MM/YY)";
      }
      if (!(/^\d{3}$/.exec(state.paymentDetails.cvv))) {
        stepErrors.cvv = "Please enter a valid 3-digit CVV";
      }
    } else if (state.paymentMethod === "upi") {
      if (
        !(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.exec(state.paymentDetails.upiId))
      ) {
        stepErrors.upiId = "Please enter a valid UPI ID";
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }, [state.paymentMethod, state.paymentDetails]);

  // Handler for address selection
  const handleAddressSelection = useCallback(
    (addressId: number, type: AddressType) => {
      setState((prev) => ({
        ...prev,
        addresses: {
          ...prev.addresses,
          [type]: addressId,
        },
      }));

      // Clear error for this address type
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[type];
        return newErrors;
      });
    },
    [],
  );

  // Handler for payment method selection
  const handlePaymentMethodSelection = useCallback((method: PaymentMethod) => {
    setState((prev) => ({
      ...prev,
      paymentMethod: method,
      // Reset payment details when switching methods
      paymentDetails:
        method === prev.paymentMethod
          ? prev.paymentDetails
          : {
              cardNumber: "",
              expiryDate: "",
              cvv: "",
              upiId: "",
            },
    }));
    // Clear payment-related errors
    setErrors({});
  }, []);

  // Handler for payment details changes
  const handlePaymentDetailsChange = useCallback(
    (field: keyof PaymentDetails, value: string) => {
      setState((prev) => ({
        ...prev,
        paymentDetails: {
          ...prev.paymentDetails,
          [field]: value,
        },
      }));

      // Clear error for this field
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    },
    [],
  );

  // Handler for step navigation with validation
  const handleStepNavigation = useCallback(
    async (step: CheckoutStep) => {
      if (isProcessing) return;
      setIsProcessing(true);

      console.log("Navigating to step:", step);

      try {
        if (state.currentStep === "address" && step === "payment") {
          if (!validateAddressStep()) {
            setIsProcessing(false);
            return;
          }
          await initCheckout.mutateAsync();
        } else {
          setState((prev) => ({ ...prev, currentStep: step }));
        }
      } catch (error) {
        console.error("Navigation error:", error);
        toast({
          title: "Error",
          description: "Failed to proceed. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [state.currentStep, validateAddressStep, initCheckout, isProcessing, toast],
  );

  // Handler for final checkout
  const handleCheckout = useCallback(async () => {
    if (isProcessing) return;
    if (!validatePaymentStep()) return;

    setIsProcessing(true);
    try {
      await processCheckout.mutateAsync({
        addresses: {
          shippingAddressId: state.addresses.shipping,
          // billingAddressId: state.addresses.billing,
        },
        payment: {
          method: state.paymentMethod,
          details:
            state.paymentMethod === "card"
              ? {
                  cardNumber: state.paymentDetails.cardNumber,
                  expiryDate: state.paymentDetails.expiryDate,
                  cvv: state.paymentDetails.cvv,
                }
              : state.paymentMethod === "upi"
                ? { upiId: state.paymentDetails.upiId }
                : undefined,
        },
      });
    } catch (error) {
      console.error("Checkout error:", error);

      setIsProcessing(false);
    }
  }, [
    state.addresses,
    state.paymentMethod,
    state.paymentDetails,
    isProcessing,
    validatePaymentStep,
    processCheckout,
  ]);

  // Calculate order summary including any additional charges
  const getOrderSummary = useCallback(() => {
    const cartMetadata = cart.getCartMetadata();
    const codCharges = state.paymentMethod === "cod" ? 50 : 0;

    return {
      ...cartMetadata,
      codCharges,
      total: cartMetadata.total + codCharges,
    };
  }, [cart, state.paymentMethod]);

  return {
    state,
    isProcessing,
    errors,
    handleAddressSelection,
    handlePaymentMethodSelection,
    handlePaymentDetailsChange,
    handleStepNavigation,
    handleCheckout,
    getOrderSummary,
  };
}
