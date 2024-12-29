// src/app/(shop)/checkout/_components/PaymentSection/CardForm.tsx
"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, AlertCircle } from "lucide-react";

// Define the structure for card details
interface CardDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

interface CardFormProps {
  details: CardDetails;
  onChange: (field: keyof CardDetails, value: string) => void;
  errors: Partial<Record<keyof CardDetails, string>>;
  disabled: boolean;
}

export function CardForm({
  details,
  onChange,
  errors,
  disabled,
}: CardFormProps) {
  // State for formatting display of card number
  const [formattedCardNumber, setFormattedCardNumber] = useState("");

  // Format card number with spaces for display
  useEffect(() => {
    const formatted =
      details.cardNumber
        .replace(/\s/g, "")
        .match(/.{1,4}/g)
        ?.join(" ") || details.cardNumber;
    setFormattedCardNumber(formatted);
  }, [details.cardNumber]);

  // Handler for card number input
  const handleCardNumberChange = (value: string) => {
    // Remove any non-digit characters
    const cleaned = value.replace(/\D/g, "").slice(0, 16);
    onChange("cardNumber", cleaned);
  };

  // Handler for expiry date input with automatic formatting
  const handleExpiryDateChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    let formatted = cleaned;

    // Add slash after month if entering numbers
    if (cleaned.length >= 2) {
      formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }

    // Validate month range (01-12)
    if (cleaned.length >= 2) {
      const month = parseInt(cleaned.slice(0, 2));
      if (month < 1 || month > 12) return;
    }

    onChange("expiryDate", formatted);
  };

  // Helper function to determine card type based on number
  const getCardType = (number: string): string => {
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6/,
    };

    for (const [card, pattern] of Object.entries(patterns)) {
      if (pattern.test(number)) return card;
    }
    return "unknown";
  };

  return (
    <div className="space-y-6">
      {/* Card type indicator */}
      <div className="flex items-center space-x-2">
        <CreditCard className="h-5 w-5 text-gray-400" />
        <span className="text-sm text-gray-600">
          {getCardType(details.cardNumber) !== "unknown"
            ? `${getCardType(details.cardNumber).toUpperCase()} Card`
            : "Card Details"}
        </span>
      </div>

      <div className="space-y-4">
        {/* Card Number Field */}
        <div className="space-y-2">
          <Label htmlFor="cardNumber">
            Card Number
            <span className="ml-1 text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="cardNumber"
              value={formattedCardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              placeholder="1234 5678 9012 3456"
              disabled={disabled}
              maxLength={19} // 16 digits + 3 spaces
              className={errors.cardNumber ? "border-red-500 pr-10" : "pr-10"}
            />
            {errors.cardNumber && (
              <AlertCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
            )}
          </div>
          {errors.cardNumber && (
            <p className="text-sm text-red-500">{errors.cardNumber}</p>
          )}
        </div>

        {/* Expiry and CVV Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expiryDate">
              Expiry Date
              <span className="ml-1 text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="expiryDate"
                value={details.expiryDate}
                onChange={(e) => handleExpiryDateChange(e.target.value)}
                placeholder="MM/YY"
                disabled={disabled}
                maxLength={5}
                className={errors.expiryDate ? "border-red-500" : ""}
              />
              {errors.expiryDate && (
                <AlertCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
              )}
            </div>
            {errors.expiryDate && (
              <p className="text-sm text-red-500">{errors.expiryDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cvv">
              CVV
              <span className="ml-1 text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="cvv"
                type="password"
                value={details.cvv}
                onChange={(e) =>
                  onChange("cvv", e.target.value.replace(/\D/g, "").slice(0, 3))
                }
                placeholder="123"
                disabled={disabled}
                maxLength={3}
                className={errors.cvv ? "border-red-500" : ""}
              />
              {errors.cvv && (
                <AlertCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
              )}
            </div>
            {errors.cvv && <p className="text-sm text-red-500">{errors.cvv}</p>}
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <Alert variant="secondary" className="bg-gray-50">
        <AlertDescription className="flex items-center text-sm text-gray-600">
          <span className="mr-2">🔒</span>
          Your payment information is encrypted and secure. We never store your
          card details.
        </AlertDescription>
      </Alert>
    </div>
  );
}
