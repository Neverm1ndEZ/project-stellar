import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { orderId: string };
}) {
  const orderId = searchParams.orderId;

  return (
    <div className="container mx-auto flex min-h-[80vh] max-w-2xl items-center justify-center px-4 py-16">
      <Card className="w-full">
        <CardContent className="flex flex-col items-center space-y-6 p-8 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600">
              Thank you for your purchase. Your order has been received and is
              being processed.
            </p>
          </div>

          {orderId && (
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-sm text-gray-600">Order Reference:</p>
              <p className="font-mono text-lg font-medium">{orderId}</p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              We have sent an email confirmation with order details and tracking
              information.
            </p>
            <p className="text-sm text-gray-600">
              You can also track your order status in the orders section of your
              account.
            </p>
          </div>

          <div className="flex space-x-4">
            <Link href={`/orders/${orderId}`}>
              <Button>View Order</Button>
            </Link>
            <Link href="/products">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
