// src/app/(auth)/register/_components/RegisterForm.tsx
"use client";

import { useState } from "react";
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
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/utils/useAuth";
import { GoogleButton } from "../../_components/GoogleButton";
import { OrDivider } from "../../_components/OrDivider";
import { TermsText } from "../../_components/TermsText";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

// Strong password regex: at least 8 chars, 1 uppercase, 1 lowercase, 1 number
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export function RegisterForm() {
  const { registerUser, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});

  // Validate form fields as user types
  const validateField = (name: keyof RegisterFormData, value: string) => {
    const newErrors: Partial<RegisterFormData> = { ...errors };
    delete newErrors[name];

    switch (name) {
      case "firstName":
      case "lastName":
        if (value.length < 2) {
          newErrors[name] = "Must be at least 2 characters";
        }
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[name] = "Invalid email address";
        }
        break;
      case "phone":
        if (!/^\+?[1-9]\d{9,14}$/.test(value)) {
          newErrors[name] = "Invalid phone number";
        }
        break;
      case "password":
        if (!passwordRegex.test(value)) {
          newErrors[name] =
            "Password must be at least 8 characters with uppercase, lowercase, and numbers";
        }
        break;
      case "confirmPassword":
        if (value !== formData.password) {
          newErrors[name] = "Passwords do not match";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name as keyof RegisterFormData, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const validations = Object.entries(formData).map(([key, value]) =>
      validateField(key as keyof RegisterFormData, value),
    );

    if (validations.some((valid) => !valid)) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please check the form for errors",
      });
      return;
    }

    // Attempt registration
    try {
      const success = await registerUser({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      if (success) {
        // Registration successful - user will be automatically redirected
        toast({
          title: "Registration successful",
          description: "Please verify your phone number to continue",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description:
          "Please try again or contact support if the problem persists",
      });
    }
  };

  return (
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
        <GoogleButton />
        <OrDivider />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                required
                autoComplete="given-name"
                error={errors.firstName}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
                autoComplete="family-name"
                error={errors.lastName}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              error={errors.email}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Phone field */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+1234567890"
              value={formData.phone}
              onChange={handleChange}
              required
              autoComplete="tel"
              error={errors.phone}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* Password fields */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              error={errors.password}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              error={errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

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

        <TermsText />
      </CardContent>
    </Card>
  );
}
