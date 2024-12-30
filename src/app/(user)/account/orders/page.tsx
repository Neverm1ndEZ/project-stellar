"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";
import { Package, RefreshCcw, ShoppingCart, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

interface OrderItem {
  id: number;
  quantity: number;
  price: string;
  product: {
    name: string;
  };
}

interface Order {
  id: number;
  status: string;
  createdAt: string | Date | null;
  totalPrice: string;
  items: OrderItem[];
}

// Helper function to filter orders by date range
const filterOrdersByDate = (orders: Order[], period: string) => {
  const now = new Date();
  const monthsAgo = new Date();

  switch (period) {
    case "last3months":
      monthsAgo.setMonth(now.getMonth() - 3);
      break;
    case "last6months":
      monthsAgo.setMonth(now.getMonth() - 6);
      break;
    default:
      return orders;
  }

  return orders.filter(
    (order) => order.createdAt && new Date(order.createdAt) >= monthsAgo,
  );
};

// Status badge component with different colors for each status
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PAID":
        return "bg-blue-100 text-blue-800";
      case "PROCESSING":
        return "bg-purple-100 text-purple-800";
      case "SHIPPED":
        return "bg-indigo-100 text-indigo-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(status)}`}
    >
      {status}
    </span>
  );
};

// Individual order card component
const OrderCard = ({
  order,
  onCancel,
}: {
  order: Order;
  onCancel: (orderId: number) => void;
}) => {
  const canCancel = ["PENDING", "PAID"].includes(order.status);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Order #{order.id}</p>
            <p className="text-sm text-gray-500">
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <StatusBadge status={order.status} />
            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel(order.id)}
                className="text-red-600 hover:text-red-700"
              >
                Cancel Order
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {order.items.map((item: OrderItem) => (
          <div
            key={item.id}
            className="flex items-center justify-between border-t py-2"
          >
            <div>
              <p className="font-medium">{item.product.name}</p>
              <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
            </div>
            <p className="font-medium">
              {formatCurrency(parseFloat(item.price))}
            </p>
          </div>
        ))}
        <div className="mt-4 flex justify-between border-t pt-2">
          <p className="font-medium">Total Amount</p>
          <p className="font-medium">
            {formatCurrency(parseFloat(order.totalPrice))}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default function OrdersPage() {
  const [timePeriod, setTimePeriod] = useState("last3months");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  // Fetch orders using tRPC
  const { data: orders, isLoading } = api.order.getUserOrders.useQuery();

  // Simplified cancel handler that just shows a toast
  const handleCancelOrder = (orderId: number) => {
    toast({
      title: "Order cancellation requested",
      description:
        "Your cancellation request has been received. We'll process it shortly.",
      duration: 5000,
    });
  };

  // Filter orders based on selected period and status
  const filteredOrders = orders ? filterOrdersByDate(orders, timePeriod) : [];
  const displayOrders =
    activeTab === "all"
      ? filteredOrders
      : filteredOrders.filter(
          (order) => order.status.toLowerCase() === activeTab,
        );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <ShoppingCart className="mb-4 h-12 w-12 text-gray-400" />
        <h3 className="text-lg font-semibold">No orders found</h3>
        <p className="text-gray-500">Start shopping to see your orders here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Orders</h1>
          <p className="text-gray-500">Track and manage your orders</p>
        </div>
        <Select value={timePeriod} onValueChange={setTimePeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last3months">Last 3 months</SelectItem>
            <SelectItem value="last6months">Last 6 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            All Orders
          </TabsTrigger>
          <TabsTrigger value="processing" className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            Processing
          </TabsTrigger>
          <TabsTrigger value="delivered" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Delivered
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {displayOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onCancel={handleCancelOrder}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
