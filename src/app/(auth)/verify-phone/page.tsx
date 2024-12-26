"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { api } from "@/trpc/react";

const PhoneVerificationPage = () => {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const searchParams = useSearchParams();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);

  const handleSendCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Implement your phone verification logic here
      // This would typically involve:
      // 1. Validating the phone number format
      // 2. Sending an OTP via SMS
      // 3. Storing the verification state

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API call
      setCodeSent(true);
    } catch (error) {
      setError("Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPhone = api.auth.verifyPhone.useMutation({
    onSuccess: async () => {
      // Update the session to reflect the new verification status
      await updateSession();

      // Redirect to the intended destination or home
      const from = searchParams.get("from") ?? "/";
      router.push(from);
    },
  });

  const handleVerifyCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Verify the phone number
      await verifyPhone.mutateAsync({
        phoneNumber: phoneNumber,
      });
    } catch (error) {
      setError("Verification failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
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
          {!codeSent ? (
            // Phone Number Input Stage
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isLoading}
                  required
                  className="text-lg"
                />
              </div>

              <Button
                onClick={handleSendCode}
                disabled={isLoading || !phoneNumber}
                className="w-full"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending Code...
                  </span>
                ) : (
                  "Send Verification Code"
                )}
              </Button>
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
                  onChange={(e) => setVerificationCode(e.target.value)}
                  disabled={isLoading}
                  required
                  className="text-center text-xl tracking-widest"
                  maxLength={6}
                />
                <p className="text-sm text-gray-500">
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

                <Button
                  variant="ghost"
                  onClick={() => {
                    setCodeSent(false);
                    setVerificationCode("");
                  }}
                  disabled={isLoading}
                  className="w-full text-gray-500 hover:text-red-600"
                >
                  Change Phone Number
                </Button>
              </div>
            </div>
          )}

          {error && <p className="text-center text-sm text-red-500">{error}</p>}

          <div className="space-y-2">
            <p className="text-center text-sm text-gray-500">
              We&apos;ll only use your phone number to send you important
              updates about your orders and account security.
            </p>
            <p className="text-center text-xs text-gray-400">
              Standard message and data rates may apply
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhoneVerificationPage;
