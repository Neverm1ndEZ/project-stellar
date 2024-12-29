// src/app/(shop)/checkout/_components/PaymentSection/index.tsx
"use client";

import { type PaymentMethod } from "@/hooks/useCheckout";
import { CardForm } from "./CardForm";
import { UPIForm } from "./UPIForm";
import { CODForm } from "./CODForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, QrCode, Truck } from "lucide-react";

interface PaymentSectionProps {
  selectedMethod: PaymentMethod;
  paymentDetails: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    upiId: string;
  };
  onMethodSelect: (method: PaymentMethod) => void;
  onDetailsChange: (field: string, value: string) => void;
  errors: Record<string, string>;
  isProcessing: boolean;
}

export function PaymentSection({
  selectedMethod,
  paymentDetails,
  onMethodSelect,
  onDetailsChange,
  errors,
  isProcessing,
}: PaymentSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={selectedMethod}
          onValueChange={(value) => onMethodSelect(value as PaymentMethod)}
          className="space-y-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Credit/Debit Card
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="upi" id="upi" />
            <Label htmlFor="upi" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              UPI Payment
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cod" id="cod" />
            <Label htmlFor="cod" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Cash on Delivery
            </Label>
          </div>
        </RadioGroup>

        <div className="pt-4">
          {selectedMethod === "card" && (
            <CardForm
              details={paymentDetails}
              onChange={onDetailsChange}
              errors={errors}
              disabled={isProcessing}
            />
          )}

          {selectedMethod === "upi" && (
            <UPIForm
              upiId={paymentDetails.upiId}
              onChange={(value) => onDetailsChange("upiId", value)}
              error={errors.upiId}
              disabled={isProcessing}
            />
          )}

          {selectedMethod === "cod" && <CODForm disabled={isProcessing} />}
        </div>
      </CardContent>
    </Card>
  );
}
