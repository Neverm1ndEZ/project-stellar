// src/utils/usePhoneVerification.ts
import { useState, useCallback } from "react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

// Constants for verification process
const VERIFICATION_TIMEOUT = 60; // seconds
const MAX_ATTEMPTS = 3;
const MOCK_OTP = "123456"; // Only for development

export function usePhoneVerification() {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStarted, setVerificationStarted] = useState(false);
  const [timeoutRemaining, setTimeoutRemaining] = useState(0);
  const [attempts, setAttempts] = useState(0);

  // Utilities
  const router = useRouter();
  const { update: updateSession } = useSession();
  const { toast } = useToast();

  // Query verification status
  const verificationStatus = api.auth.checkPhoneVerification.useQuery(
    undefined,
    {
      // Refresh every minute while verification is in progress
      refetchInterval: verificationStarted ? 60000 : false,
    },
  );

  // TRPC mutations with proper error handling
  const startVerificationMutation = api.auth.startPhoneVerification.useMutation(
    {
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: error.message || "Failed to start verification process",
        });
      },
    },
  );

  const verifyOtpMutation = api.auth.verifyPhoneOtp.useMutation({
    onError: (error) => {
      setAttempts((prev) => prev + 1);
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: error.message || "Please check the code and try again",
      });
    },
  });

  // Handle countdown timer
  const startCountdown = useCallback(() => {
    setTimeoutRemaining(VERIFICATION_TIMEOUT);
    const timer = setInterval(() => {
      setTimeoutRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Phone number validation
  const validatePhoneNumber = useCallback((phoneNumber: string) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw new Error("Invalid phone number format");
    }
    return phoneNumber;
  }, []);

  // Start verification process
  const startVerification = useCallback(
    async (phoneNumber: string) => {
      try {
        setIsLoading(true);

        // Validate phone number format
        const validatedPhone = validatePhoneNumber(phoneNumber);

        // Check if already verified
        if (verificationStatus.data?.isVerified) {
          const returnUrl =
            new URLSearchParams(window.location.search).get("from") || "/";
          router.push(returnUrl);
          return;
        }

        // Check attempt limits
        if (attempts >= MAX_ATTEMPTS) {
          toast({
            variant: "destructive",
            title: "Too Many Attempts",
            description: "Please try again after some time",
          });
          return;
        }

        // Start verification process
        await startVerificationMutation.mutateAsync({
          phoneNumber: validatedPhone,
        });

        // In development, log the mock OTP
        if (process.env.NODE_ENV === "development") {
          console.log(`Mock OTP for ${validatedPhone}: ${MOCK_OTP}`);
        }

        setVerificationStarted(true);
        startCountdown();

        toast({
          title: "Verification Code Sent",
          description: "Please check your phone for the verification code",
        });
      } catch (error) {
        console.error("Verification error:", error);
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description:
            error instanceof Error ? error.message : "An error occurred",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      verificationStatus.data?.isVerified,
      attempts,
      router,
      startVerificationMutation,
      startCountdown,
      validatePhoneNumber,
      toast,
    ],
  );

  // Verify OTP code
  const verifyOtp = useCallback(
    async (otp: string, phoneNumber: string) => {
      try {
        setIsLoading(true);

        // Validate inputs
        if (otp.length !== 6) {
          throw new Error("Invalid verification code");
        }
        const validatedPhone = validatePhoneNumber(phoneNumber);

        // Verify the OTP
        await verifyOtpMutation.mutateAsync({
          otp,
          phoneNumber: validatedPhone,
        });

        // Update session with new phone number
        await updateSession();

        toast({
          title: "Phone Verified",
          description: "Your phone number has been verified successfully",
        });

        // Get return URL or default to home
        const returnUrl =
          new URLSearchParams(window.location.search).get("from") || "/";
        router.push(returnUrl);
      } catch (error) {
        console.error("OTP verification error:", error);
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description:
            error instanceof Error
              ? error.message
              : "Invalid verification code",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [verifyOtpMutation, updateSession, validatePhoneNumber, router, toast],
  );

  return {
    isLoading,
    verificationStarted,
    timeoutRemaining,
    attempts,
    isVerified: verificationStatus.data?.isVerified ?? false,
    canResend: timeoutRemaining === 0,
    hasReachedMaxAttempts: attempts >= MAX_ATTEMPTS,
    startVerification,
    verifyOtp,
  };
}
