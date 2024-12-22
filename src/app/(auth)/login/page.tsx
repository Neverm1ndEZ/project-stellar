"use client";

import React, { useState } from 'react';
import { signIn } from "next-auth/react";
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Loader2 } from 'lucide-react';

const Page = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/dashboard";

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signIn("google", {
        callbackUrl: from,
        redirect: true,
      });
    } catch (error) {
      console.error("Authentication error:", error);
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-[380px] border-2 border-blue-100 dark:border-gray-700">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <Shield className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl text-center">
            Welcome to Safety
          </CardTitle>
          <CardDescription className="text-center">
            Your identity remains protected. Sign in to access support and
            resources.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <p className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-900/10 p-2 rounded">
              {error}
            </p>
          )}
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-6 text-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Connecting...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                  />
                  <path
                    fill="#FF3D00"
                    d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                  />
                </svg>
                Continue with Google
              </span>
            )}
          </Button>
          <div className="space-y-2">
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              By signing in, you&apos;re taking the first step towards a safer
              online experience. We&apos;re here to help.
            </p>
            <p className="text-xs text-center text-gray-400 dark:text-gray-500">
              Protected by industry-standard encryption
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;