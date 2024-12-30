"use client";

import { type CheckoutStep } from "@/hooks/useCheckout";
import { cn } from "@/lib/utils";

interface CheckoutStepsProps {
  currentStep: CheckoutStep;
  onStepClick: (step: CheckoutStep) => void;
}

const steps: { id: CheckoutStep; label: string }[] = [
  { id: "address", label: "Address" },
  { id: "payment", label: "Payment" },
];

export function CheckoutSteps({
  currentStep,
  onStepClick,
}: CheckoutStepsProps) {
  return (
    <nav aria-label="Checkout Progress" className="relative">
      {/* Progress bar background */}
      <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-gray-200" />

      {/* Steps container */}
      <ol className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted =
            steps.findIndex((s) => s.id === currentStep) > index;
          const isCurrent = currentStep === step.id;

          return (
            <li key={step.id} className="flex flex-1 items-center">
              <button
                onClick={() => isCompleted && onStepClick(step.id)}
                disabled={!isCompleted && !isCurrent}
                className={cn(
                  "flex items-center space-x-2 rounded-full px-4 py-2 text-sm font-medium",
                  {
                    "hover:text-brand-600 cursor-pointer": isCompleted,
                    "text-brand-600": isCurrent,
                    "text-gray-500": !isCompleted && !isCurrent,
                  },
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    {
                      "bg-gray-600 text-white": isCurrent,
                      "bg-green-500 text-white": isCompleted,
                      "bg-gray-200 text-gray-700": !isCompleted && !isCurrent,
                    },
                  )}
                >
                  {index + 1}
                </span>
                <span>{step.label}</span>
              </button>

              {index !== steps.length - 1 && (
                <div
                  className={cn("h-0.5 flex-1", {
                    "bg-brand-600": isCompleted,
                    "bg-gray-200": !isCompleted,
                  })}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
