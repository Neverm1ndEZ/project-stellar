// src/app/(shop)/checkout/error/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function CheckoutErrorPage() {
  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-16">
      <Card className="mx-auto w-full max-w-md text-center">
        <CardContent className="pt-6">
          <div className="mb-4 flex justify-center">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Payment Failed</h1>
          <p className="mb-6 text-gray-600">
            We encountered an issue processing your payment. Don&apos;t worry,
            no charges were made to your account.
          </p>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-600">Common issues include:</p>
            <ul className="mt-2 text-sm text-gray-600">
              <li>Insufficient funds</li>
              <li>Incorrect card details</li>
              <li>Bank declined the transaction</li>
              <li>Network connectivity issues</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button asChild variant="outline">
            <Link href="/cart">Return to Cart</Link>
          </Button>
          <Button asChild>
            <Link href="/checkout">Try Again</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
