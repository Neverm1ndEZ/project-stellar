// app/(user)/users/[id]/orders/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, RefreshCcw, ShoppingCart, Truck } from "lucide-react";

export default function OrdersPage({ params }: { params: { id: string } }) {
  // In a real app, this would be fetched from your backend
  const mockOrders = [
    {
      id: "ORD001",
      date: "2024-03-20",
      status: "delivered",
      total: 2500,
      items: [{ name: "Mango Pickle", quantity: 2, price: 1250 }],
    },
    {
      id: "ORD002",
      date: "2024-03-15",
      status: "processing",
      total: 1800,
      items: [{ name: "Lemon Pickle", quantity: 1, price: 1800 }],
    },
  ];

  const OrderCard = ({ order }: { order: (typeof mockOrders)[0] }) => (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Order #{order.id}</p>
            <p className="text-sm text-gray-500">
              Placed on {new Date(order.date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {order.status === "delivered" ? (
              <Package className="h-5 w-5 text-green-600" />
            ) : (
              <Truck className="h-5 w-5 text-blue-600" />
            )}
            <span className="text-sm font-medium capitalize">
              {order.status}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {order.items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-t py-2"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
            </div>
            <p className="font-medium">₹{item.price}</p>
          </div>
        ))}
        <div className="mt-4 flex justify-between border-t pt-2">
          <p className="font-medium">Total</p>
          <p className="font-medium">₹{order.total}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Orders</h1>
          <p className="text-gray-500">Track and manage your orders</p>
        </div>
        <Select defaultValue="last3months">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last3months">Last 3 months</SelectItem>
            <SelectItem value="last6months">Last 6 months</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all">
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

        <TabsContent value="all" className="mt-6">
          {mockOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </TabsContent>

        <TabsContent value="processing" className="mt-6">
          {mockOrders
            .filter((order) => order.status === "processing")
            .map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
        </TabsContent>

        <TabsContent value="delivered" className="mt-6">
          {mockOrders
            .filter((order) => order.status === "delivered")
            .map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
