// app/(user)/users/[id]/payments/page.tsx
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CreditCard,
  Plus,
  Trash2,
  ChevronsUpDown,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PaymentsPage() {
  const [savedCards] = useState([
    {
      id: 1,
      cardNumber: "•••• •••• •••• 4242",
      cardHolder: "John Doe",
      expiryDate: "12/25",
      type: "visa",
      isDefault: true,
    },
    {
      id: 2,
      cardNumber: "•••• •••• •••• 5555",
      cardHolder: "John Doe",
      expiryDate: "09/24",
      type: "mastercard",
      isDefault: false,
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Methods</h1>
          <p className="text-gray-500">
            Manage your payment methods and preferences
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Card
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Card</DialogTitle>
            </DialogHeader>
            <CardForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {savedCards.map((card) => (
          <PaymentCard key={card.id} card={card} />
        ))}
      </div>

      <Card className="mt-8">
        <CardContent className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Auto-Pay Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Default Payment Method</p>
                <p className="text-sm text-gray-500">
                  Used for subscriptions and quick checkout
                </p>
              </div>
              <Select defaultValue="card1">
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {savedCards.map((card) => (
                    <SelectItem key={card.id} value={`card${card.id}`}>
                      {card.cardNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Payment Reminders</p>
                <p className="text-sm text-gray-500">
                  Get notified before subscription renewals
                </p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CardForm() {
  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cardNumber">Card Number</Label>
        <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cardHolder">Card Holder Name</Label>
        <Input id="cardHolder" placeholder="Name on card" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input id="expiryDate" placeholder="MM/YY" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cvv">CVV</Label>
          <Input id="cvv" type="password" maxLength={4} placeholder="•••" />
        </div>
      </div>

      <Button type="submit" className="w-full">
        Save Card
      </Button>
    </form>
  );
}

function PaymentCard({ card }: { card: any }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-500" />
            <span className="font-medium">{card.cardNumber}</span>
            {card.isDefault && (
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-600">
                Default
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-1 text-gray-600">
          <p>{card.cardHolder}</p>
          <p>Expires: {card.expiryDate}</p>
        </div>

        {!card.isDefault && (
          <Button variant="outline" className="mt-4">
            Set as Default
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
