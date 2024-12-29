// src/app/(shop)/checkout/_components/PaymentSection/CODForm.tsx
"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Truck, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CODFormProps {
  disabled: boolean;
  className?: string;
}

export function CODForm({ disabled, className }: CODFormProps) {
  const restrictions = [
    "Keep exact change ready for a contactless delivery",
    "Service may be limited in certain areas",
    "Additional charges of ₹50 will be applied",
    "Not available during local restrictions",
  ];

  const eligibilityConditions = [
    "Order value must be less than ₹10,000",
    "Available only for residential addresses",
    "Delivery timing between 9 AM - 7 PM",
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Primary Alert */}
      <Alert variant="warning">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Cash on Delivery is available with additional charges of ₹50. Digital
          payments are recommended for a safer experience.
        </AlertDescription>
      </Alert>

      {/* Delivery Instructions */}
      <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
        <div className="mb-3 flex items-center text-sm font-medium text-gray-700">
          <Truck className="mr-2 h-4 w-4" />
          Delivery Instructions
        </div>
        <ul className="ml-6 list-disc space-y-2 text-sm text-gray-600">
          {restrictions.map((restriction, index) => (
            <li key={index}>{restriction}</li>
          ))}
        </ul>
      </div>

      <Separator />

      {/* Eligibility Information */}
      <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
        <div className="mb-3 flex items-center text-sm font-medium text-gray-700">
          <Info className="mr-2 h-4 w-4" />
          Eligibility Conditions
        </div>
        <ul className="ml-6 list-disc space-y-2 text-sm text-gray-600">
          {eligibilityConditions.map((condition, index) => (
            <li key={index}>{condition}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
