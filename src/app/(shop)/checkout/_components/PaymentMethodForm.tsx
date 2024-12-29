// src/app/(shop)/checkout/_components/PaymentMethodForm.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { type z } from "zod";
import { type paymentDetailsSchema } from "@/server/db/checkout-schema";

type PaymentDetails = z.infer<typeof paymentDetailsSchema>;

interface PaymentMethodFormProps {
  value: PaymentDetails;
  onChange: (details: PaymentDetails) => void;
}

export function PaymentMethodForm({ value, onChange }: PaymentMethodFormProps) {
  // Local state for form values
  const [localDetails, setLocalDetails] = useState<Record<string, string>>({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    upiId: "",
  });

  // Format card number as user types (adds spaces every 4 digits)
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const matches = cleaned.match(/(\d{4})|(\d{1,4})/g);
    return matches ? matches.join(" ") : "";
  };

  // Format expiry date as user types (adds / after 2 digits)
  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  // Handle payment method change
  const handleMethodChange = (method: PaymentDetails["method"]) => {
    switch (method) {
      case "card":
        onChange({
          method,
          cardNumber: localDetails.cardNumber?.replace(/\s/g, ""),
          expiryDate: localDetails.expiryDate,
          cvv: localDetails.cvv,
        });
        break;
      case "upi":
        onChange({
          method,
          upiId: localDetails.upiId,
        });
        break;
      case "cod":
        onChange({ method });
        break;
    }
  };

  // Update local state and trigger parent update
  const handleDetailsChange = (field: string, value: string) => {
    setLocalDetails((prev) => {
      const updated = { ...prev, [field]: value };

      // Update parent based on current payment method
      if (value.method === "card" && field.startsWith("card")) {
        onChange({
          method: "card",
          cardNumber: updated.cardNumber.replace(/\s/g, ""),
          expiryDate: updated.expiryDate,
          cvv: updated.cvv,
        });
      } else if (value.method === "upi" && field === "upiId") {
        onChange({
          method: "upi",
          upiId: updated.upiId,
        });
      }

      return updated;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={value.method}
          onValueChange={handleMethodChange}
          className="space-y-4"
        >
          {/* Credit/Debit Card Option */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="card" id="payment-card" />
              <label
                htmlFor="payment-card"
                className="text-sm font-medium leading-none"
              >
                Credit/Debit Card
              </label>
            </div>
            {value.method === "card" && (
              <div className="ml-6 space-y-4">
                <Input
                  placeholder="Card Number"
                  value={localDetails.cardNumber}
                  onChange={(e) => {
                    const formatted = formatCardNumber(e.target.value);
                    if (formatted.length <= 19) {
                      // 16 digits + 3 spaces
                      handleDetailsChange("cardNumber", formatted);
                    }
                  }}
                  maxLength={19}
                  autoComplete="cc-number"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="MM/YY"
                    value={localDetails.expiryDate}
                    onChange={(e) => {
                      const formatted = formatExpiryDate(e.target.value);
                      if (formatted.length <= 5) {
                        handleDetailsChange("expiryDate", formatted);
                      }
                    }}
                    maxLength={5}
                    autoComplete="cc-exp"
                  />
                  <Input
                    placeholder="CVV"
                    type="password"
                    value={localDetails.cvv}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, "");
                      if (cleaned.length <= 3) {
                        handleDetailsChange("cvv", cleaned);
                      }
                    }}
                    maxLength={3}
                    autoComplete="cc-csc"
                  />
                </div>
              </div>
            )}
          </div>

          {/* UPI Payment Option */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="upi" id="payment-upi" />
              <label
                htmlFor="payment-upi"
                className="text-sm font-medium leading-none"
              >
                UPI Payment
              </label>
            </div>
            {value.method === "upi" && (
              <div className="ml-6">
                <Input
                  placeholder="Enter UPI ID (e.g., name@upi)"
                  value={localDetails.upiId}
                  onChange={(e) => handleDetailsChange("upiId", e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Cash on Delivery Option */}
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cod" id="payment-cod" />
            <label
              htmlFor="payment-cod"
              className="text-sm font-medium leading-none"
            >
              Cash on Delivery
              <span className="ml-2 text-xs text-gray-500">
                (Additional ₹50 charge)
              </span>
            </label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
