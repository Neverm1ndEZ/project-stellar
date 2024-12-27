// src/app/(auth)/_components/AuthLayout.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface AuthLayoutProps {
  children: React.ReactNode;
  heading: string;
  subheading: string;
  sidebarContent?: React.ReactNode;
}

export function AuthLayout({
  children,
  heading,
  subheading,
  sidebarContent,
}: AuthLayoutProps) {
  const router = useRouter();

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
          <h1 className="mb-4 text-4xl font-bold">{heading}</h1>
          <p className="text-xl font-medium text-red-800">{subheading}</p>
        </div>

        {sidebarContent}
      </div>

      {/* Right Column - Form */}
      <div className="flex flex-1 items-center justify-center bg-white p-8 md:p-16">
        {children}
      </div>
    </div>
  );
}
