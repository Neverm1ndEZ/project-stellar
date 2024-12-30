// app/(user)/users/[id]/subscriptions/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Package,
  Pause,
  Play,
  RefreshCw,
  Settings,
  XCircle,
} from "lucide-react";
import { useState } from "react";

export default function SubscriptionsPage() {
  // In a real app, this would be fetched from your backend
  const [subscriptions] = useState([
    {
      id: 1,
      name: "Monthly Pickle Box",
      status: "active",
      price: 1499,
      interval: "monthly",
      nextDelivery: "2024-04-15",
      items: [
        { name: "Mango Pickle", quantity: 1 },
        { name: "Lemon Pickle", quantity: 1 },
        { name: "Mixed Vegetable Pickle", quantity: 1 },
      ],
      lastDelivery: "2024-03-15",
    },
    {
      id: 2,
      name: "Quarterly Premium Box",
      status: "paused",
      price: 3999,
      interval: "quarterly",
      nextDelivery: "N/A",
      items: [
        { name: "Premium Mango Pickle", quantity: 2 },
        { name: "Garlic Pickle", quantity: 1 },
        { name: "Ginger Pickle", quantity: 1 },
        { name: "Special Mix Pickle", quantity: 1 },
      ],
      lastDelivery: "2024-02-15",
    },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Your Subscriptions</h1>
        <p className="text-gray-500">
          Manage your pickle box subscriptions and delivery schedule
        </p>
      </div>

      <div className="space-y-6">
        {subscriptions.map((subscription) => (
          <SubscriptionCard key={subscription.id} subscription={subscription} />
        ))}
      </div>

      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                Start a New Subscription
              </h3>
              <p className="text-gray-500">
                Choose from our curated pickle box subscriptions
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>View Available Plans</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Subscription Plans</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 pt-4 md:grid-cols-2">
                  <PlanCard
                    name="Monthly Pickle Box"
                    price={1499}
                    interval="monthly"
                    features={[
                      "3 Different Pickles Monthly",
                      "Free Delivery",
                      "Cancel Anytime",
                      "Monthly Recipe Card",
                    ]}
                  />
                  <PlanCard
                    name="Quarterly Premium Box"
                    price={3999}
                    interval="quarterly"
                    features={[
                      "5 Premium Pickles Quarterly",
                      "Priority Delivery",
                      "Exclusive Recipes",
                      "Special Seasonal Items",
                    ]}
                    highlighted
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SubscriptionCard({ subscription }: { subscription: any }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between md:justify-start md:gap-4">
              <div>
                <h3 className="text-xl font-semibold">{subscription.name}</h3>
                <p className="text-gray-500">
                  ₹{subscription.price} / {subscription.interval}
                </p>
              </div>
              <StatusBadge status={subscription.status} />
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Next Delivery: {subscription.nextDelivery}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Last Delivery: {subscription.lastDelivery}
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Items in this box:</p>
              <ul className="list-inside list-disc space-y-1 text-gray-600">
                {subscription.items.map((item: any, index: number) => (
                  <li key={index}>
                    {item.name} × {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {subscription.status === "active" ? (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {}}
              >
                <Pause className="mr-2 h-4 w-4" />
                Pause Subscription
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {}}
              >
                <Play className="mr-2 h-4 w-4" />
                Resume Subscription
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {}}
            >
              <Settings className="mr-2 h-4 w-4" />
              Manage Items
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => {}}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Subscription
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusStyles = {
    active: "bg-green-100 text-green-700",
    paused: "bg-yellow-100 text-yellow-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const statusIcons = {
    active: CheckCircle2,
    paused: Pause,
    cancelled: XCircle,
  };

  const Icon = statusIcons[status as keyof typeof statusIcons];

  return (
    <span
      className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium capitalize ${statusStyles[status as keyof typeof statusStyles]}`}
    >
      <Icon className="h-4 w-4" />
      {status}
    </span>
  );
}

function PlanCard({
  name,
  price,
  interval,
  features,
  highlighted = false,
}: {
  name: string;
  price: number;
  interval: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <Card className={highlighted ? "border-2 border-red-600" : ""}>
      <CardContent className="p-6">
        {highlighted && (
          <span className="mb-4 inline-block rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-600">
            Most Popular
          </span>
        )}
        <h3 className="text-xl font-semibold">{name}</h3>
        <div className="mt-2 flex items-baseline">
          <span className="text-3xl font-bold">₹{price}</span>
          <span className="text-gray-500">/{interval}</span>
        </div>
        <ul className="mt-6 space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button className="mt-6 w-full">Subscribe Now</Button>
      </CardContent>
    </Card>
  );
}
