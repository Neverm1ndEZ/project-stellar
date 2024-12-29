// src/app/(shop)/checkout/_components/PaymentSection/UPIForm.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode } from "lucide-react";

interface UPIFormProps {
  upiId: string;
  onChange: (value: string) => void;
  error?: string;
  disabled: boolean;
}

export function UPIForm({ upiId, onChange, error, disabled }: UPIFormProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="flex items-start space-x-3">
          <QrCode className="h-5 w-5 text-gray-500" />
          <div className="text-sm text-gray-600">
            <p>Enter your UPI ID to pay directly from your bank account.</p>
            <p>Common UPI apps: Google Pay, PhonePe, Paytm, BHIM</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="upiId">UPI ID</Label>
        <Input
          id="upiId"
          value={upiId}
          onChange={(e) => onChange(e.target.value)}
          placeholder="username@upi"
          disabled={disabled}
          className={error ? "border-red-500" : ""}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
