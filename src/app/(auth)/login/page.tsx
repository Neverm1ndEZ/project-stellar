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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, Mail, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Type for authentication methods
type AuthMethod = "email" | "phone";

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/";

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email");
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
  });

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Redirect to phone verification after Google sign in
      await signIn("google", {
        callbackUrl: "/verify-phone",
        redirect: true,
      });
    } catch (error) {
      console.error("Authentication error:", error);
      setError("Failed to sign in with Google. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Here you would implement your email/phone authentication logic
      // For now, we'll just simulate the process
      const response = await signIn("credentials", {
        redirect: false,
        [authMethod]: formData[authMethod],
        password: formData.password,
      });

      if (response?.error) {
        setError("Invalid credentials. Please try again.");
      } else {
        router.push(from);
      }
    } catch (error) {
      setError("Authentication failed. Please try again.");
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
          <h1 className="mb-4 text-4xl font-bold">Amamma&apos;s Kitchen</h1>
          <p className="text-xl font-medium text-red-800">
            South Indian Pickles, Crafted with Love
          </p>
        </div>

        <div className="space-y-6 text-red-800">
          <p className="text-lg">
            Welcome to Amamma&apos;s Kitchen, where traditional South Indian
            pickle-making meets modern convenience. Our recipes have been passed
            down through generations, preserving the authentic tastes of home.
          </p>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Why Choose Us?</h2>
            <div className="space-y-2">
              <p>🌿 100% Natural Ingredients</p>
              <p>👩‍🍳 Traditional Family Recipes</p>
              <p>🏆 Premium Quality Assurance</p>
              <p>🚚 Pan India Delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex flex-1 items-center justify-center bg-white p-8 md:p-16">
        <Card className="w-full max-w-md border-red-100">
          <CardHeader className="space-y-4">
            <CardTitle className="text-2xl font-bold text-red-800">
              Welcome Back
            </CardTitle>
            <CardDescription>
              Sign in to your account to start shopping
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
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
                <span className="bg-white px-2 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <Tabs
              value={authMethod}
              onValueChange={(v) => setAuthMethod(v as AuthMethod)}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <TabsContent value="email">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                </TabsContent>

                <TabsContent value="phone">
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
                </TabsContent>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Tabs>

            <p className="text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-red-800 hover:text-red-600"
              >
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
