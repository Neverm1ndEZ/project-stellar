"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
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
import { ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/";

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signIn("google", {
        callbackUrl: "/verify-phone",
        redirect: true,
      });
    } catch (error) {
      console.error("Authentication error:", error);
      setError("Failed to sign up with Google. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Here you would implement your registration logic
      // For now, we'll simulate the process and redirect to phone verification
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/verify-phone");
    } catch (error) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left Column - About Company */}
      <div className="relative flex flex-1 flex-col justify-center bg-red-50 p-8 text-red-900 md:p-16">
        <Button
          variant="ghost"
          className="absolute left-4 top-4 flex items-center gap-2 text-red-800 hover:text-red-600"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="mb-8">
          <Image
            src="/logo.png"
            alt="Amamma's Kitchen Logo"
            width={80}
            height={80}
            className="mb-6"
          />
          <h1 className="mb-4 text-4xl font-bold">Join Our Family</h1>
          <p className="text-xl font-medium text-red-800">
            Start Your Culinary Journey with Us
          </p>
        </div>

        <div className="space-y-6 text-red-800">
          <p className="text-lg">
            Creating an account lets you order delicious pickles, track your
            orders, and get exclusive offers tailored just for you.
          </p>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Member Benefits</h2>
            <div className="space-y-2">
              <p>🎁 Get ₹100 off on your first order</p>
              <p>📦 Free shipping on orders above ₹500</p>
              <p>🎯 Exclusive access to limited editions</p>
              <p>💝 Special birthday offers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Registration Form */}
      <div className="flex flex-1 items-center justify-center bg-white p-8 md:p-16">
        <Card className="w-full max-w-md border-red-100">
          <CardHeader className="space-y-4">
            <CardTitle className="text-2xl font-bold text-red-800">
              Create an Account
            </CardTitle>
            <CardDescription>
              Join us to start exploring authentic South Indian flavors
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Button
              variant="outline"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              className="w-full py-6 text-lg transition-colors hover:bg-red-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Connecting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5" viewBox="0 0 48 48">
                    {/* Google icon paths */}
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

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-red-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-red-800 hover:text-red-600"
              >
                Sign in
              </Link>
            </p>

            <p className="text-center text-xs text-gray-500">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-red-800 hover:text-red-600">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-red-800 hover:text-red-600">
                Privacy Policy
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
