// src/app/admin/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import {
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  Loader2,
} from "lucide-react";

function StatsCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="mt-2 text-xs text-gray-600">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = api.admin.getDashboardStats.useQuery();

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-gray-600">Welcome back, Admin</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Products"
          value={stats?.totalProducts ?? 0}
          icon={Package}
          description="Active products in your store"
        />
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          description="Registered users"
        />
        <StatsCard
          title="Total Orders"
          value={stats?.totalOrders ?? 0}
          icon={ShoppingCart}
          description="Orders placed"
        />
        <StatsCard
          title="Monthly Revenue"
          value={"₹" + ((stats?.monthlyRevenue ?? 0).toLocaleString() || "0")}
          icon={TrendingUp}
          description="Revenue this month"
        />
      </div>

      {/* Recent Orders */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Recent Orders</h3>
        <div className="rounded-lg border bg-white">
          <div className="p-4">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500">
                  <th className="px-2 py-3 font-medium">Order ID</th>
                  <th className="px-2 py-3 font-medium">Customer</th>
                  <th className="px-2 py-3 font-medium">Status</th>
                  <th className="px-2 py-3 font-medium">Amount</th>
                  <th className="px-2 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats?.recentOrders?.map((order) => (
                  <tr key={order.id} className="text-sm">
                    <td className="whitespace-nowrap px-2 py-3">#{order.id}</td>
                    <td className="px-2 py-3">{order.user.name}</td>
                    <td className="px-2 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-xs font-medium",
                          {
                            "bg-green-50 text-green-700":
                              order.status === "PAID",
                            "bg-yellow-50 text-yellow-700":
                              order.status === "PENDING",
                            "bg-blue-50 text-blue-700":
                              order.status === "SHIPPED",
                          },
                        )}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-2 py-3">₹{order.totalPrice}</td>
                    <td className="px-2 py-3">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
