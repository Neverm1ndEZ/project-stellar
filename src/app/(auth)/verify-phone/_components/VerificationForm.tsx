// src/app/(auth)/verify-phone/_components/VerificationForm.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Phone } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePhoneVerification } from "@/hooks/usePhoneVerification";
import { useRouter, useSearchParams } from "next/navigation";

export function VerificationForm() {
  // State management
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  // Hooks
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const {
    isLoading,
    verificationStarted,
    timeoutRemaining,
    attempts,
    canResend,
    hasReachedMaxAttempts,
    startVerification,
    verifyOtp,
  } = usePhoneVerification();

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Format with country code if not present
    if (!digits.startsWith("91") && digits.length > 0) {
      return `+91${digits}`;
    }
    return `+${digits}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 6) {
      setVerificationCode(value);
    }
  };

  // Handle starting verification process
  const handleSendCode = async () => {
    if (phoneNumber.length < 13) {
      return; // Invalid phone number
    }
    await startVerification(phoneNumber);
  };

  // Handle verifying OTP
  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      return; // Invalid code
    }
    await verifyOtp(verificationCode, phoneNumber);
  };

  // Reset verification state
  const handleReset = () => {
    setVerificationCode("");
    setPhoneNumber("");
    router.refresh();
  };

  // Update countdown timer
  useEffect(() => {
    if (timeoutRemaining > 0) {
      const timer = setInterval(() => {
        setTimeLeft(timeoutRemaining);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeoutRemaining]);

  // Redirect if already verified
  useEffect(() => {
    if (session?.user.phoneNumber) {
      const returnUrl = searchParams.get("from") ?? "/";
      router.push(returnUrl);
    }
  }, [session, router, searchParams]);

  return (
    <Card className="w-full max-w-md border-red-100">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-center">
          <Phone className="h-12 w-12 text-red-600" />
        </div>
        <CardTitle className="text-center text-2xl">
          Verify Your Phone Number
        </CardTitle>
        <CardDescription className="text-center">
          We need to verify your phone number for additional security and to
          keep you updated about your orders.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {!verificationStarted ? (
          // Phone Number Input Stage
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 9876543210"
                value={phoneNumber}
                onChange={handlePhoneChange}
                disabled={isLoading}
                required
                className="text-lg tracking-wide"
                // Add aria labels for accessibility
                aria-describedby="phone-hint phone-error"
                inputMode="numeric"
              />
              <p id="phone-hint" className="text-sm text-gray-500">
                Enter your phone number with country code (e.g., +91 for India)
              </p>
            </div>

            <Button
              onClick={handleSendCode}
              disabled={
                isLoading || phoneNumber.length < 13 || hasReachedMaxAttempts
              }
              className="w-full"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending Code...
                </span>
              ) : hasReachedMaxAttempts ? (
                "Too many attempts. Please try again later"
              ) : (
                "Send Verification Code"
              )}
            </Button>

            {attempts > 0 && (
              <p className="text-center text-sm text-gray-500">
                Attempt {attempts} of 3
              </p>
            )}
          </div>
        ) : (
          // Verification Code Input Stage
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={handleCodeChange}
                disabled={isLoading}
                required
                className="text-center text-2xl tracking-[1em]"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                aria-describedby="code-hint code-error"
              />
              <p id="code-hint" className="text-sm text-gray-500">
                Enter the 6-digit code sent to {phoneNumber}
              </p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleVerifyCode}
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  "Verify Code"
                )}
              </Button>

              {/* Resend button with countdown */}
              {timeLeft > 0 ? (
                <p className="text-center text-sm text-gray-500">
                  Resend code in {timeLeft} seconds
                </p>
              ) : (
                <Button
                  variant="ghost"
                  onClick={handleSendCode}
                  disabled={isLoading || hasReachedMaxAttempts}
                  className="w-full text-gray-500 hover:text-red-600"
                >
                  Resend Code
                </Button>
              )}

              <Button
                variant="ghost"
                onClick={handleReset}
                disabled={isLoading}
                className="w-full text-gray-500 hover:text-red-600"
              >
                Change Phone Number
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-center text-sm text-gray-500">
            We&apos;ll only use your phone number to send you important updates
            about your orders and account security.
          </p>
          <p className="text-center text-xs text-gray-400">
            Standard message and data rates may apply
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
