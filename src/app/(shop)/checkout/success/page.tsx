// src/app/(shop)/checkout/success/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // Redirect to home if user arrives here directly without checkout
  useEffect(() => {
    if (!session) {
      router.push("/");
    }
  }, [session, router]);

  if (!session) return null;

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-16">
      <Card className="mx-auto w-full max-w-md text-center">
        <CardContent className="pt-6">
          <div className="mb-4 flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Order Confirmed!</h1>
          <p className="mb-6 text-gray-600">
            Thank you for your order. We&apos;ve received your payment and will
            start processing your order right away.
          </p>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              We&apos;ll send you an email with your order details and tracking
              information once your package ships.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button asChild variant="outline">
            <Link href="/orders">View Orders</Link>
          </Button>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
