// src/app/(shop)/checkout/page.tsx
"use client";

import { useCheckout } from "@/hooks/useCheckout";
import { CheckoutSteps } from "./_components/CheckoutSteps";
import { AddressSelector } from "./_components/AddressSelector";
import { PaymentSection } from "./_components/PaymentSection";
import { OrderSummary } from "./_components/OrderSummary";

export default function CheckoutPage() {
  const {
    state,
    isProcessing,
    errors,
    handleAddressSelection,
    handlePaymentMethodSelection,
    handlePaymentDetailsChange,
    handleStepNavigation,
    handleCheckout,
    getOrderSummary,
  } = useCheckout();

  // Each section is conditionally rendered based on the current step
  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case "address":
        return (
          <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
            <AddressSelector
              selectedAddresses={state.addresses}
              onSelectAddress={handleAddressSelection}
              errors={errors}
            />
            <OrderSummary
              summary={getOrderSummary()}
              buttonText={
                isProcessing ? "Please wait..." : "Continue to Payment"
              }
              onButtonClick={() => handleStepNavigation("payment")}
              disabled={isProcessing}
            />
          </div>
        );

      case "payment":
        return (
          <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
            <PaymentSection
              selectedMethod={state.paymentMethod}
              paymentDetails={state.paymentDetails}
              onMethodSelect={handlePaymentMethodSelection}
              onDetailsChange={handlePaymentDetailsChange}
              errors={errors}
              isProcessing={isProcessing}
            />
            <OrderSummary
              summary={getOrderSummary()}
              buttonText={isProcessing ? "Processing..." : "Place Order"}
              onButtonClick={handleCheckout}
              disabled={isProcessing}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Progress indicator */}
      <CheckoutSteps
        currentStep={state.currentStep}
        onStepClick={handleStepNavigation}
      />

      {/* Main content */}
      <main className="mt-8">{renderCurrentStep()}</main>
    </div>
  );
}
