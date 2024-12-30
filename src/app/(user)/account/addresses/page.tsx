// app/(user)/users/[id]/addresses/page.tsx
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
import { Textarea } from "@/components/ui/textarea";
import { Home, Plus, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";

export default function AddressesPage() {
  const [addresses] = useState([
    {
      id: 1,
      name: "Home",
      addressLine1: "123 Main Street",
      addressLine2: "Apartment 4B",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
      phone: "9876543210",
      isDefault: true,
    },
    {
      id: 2,
      name: "Office",
      addressLine1: "456 Business Park",
      addressLine2: "Floor 3",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560002",
      phone: "9876543211",
      isDefault: false,
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Addresses</h1>
          <p className="text-gray-500">Manage your delivery addresses</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
            </DialogHeader>
            <AddressForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {addresses.map((address) => (
          <AddressCard key={address.id} address={address} />
        ))}
      </div>
    </div>
  );
}

function AddressForm() {
  return (
    <form className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Address Name</Label>
          <Input id="name" placeholder="e.g., Home, Office" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" placeholder="Your phone number" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine1">Address Line 1</Label>
        <Input id="addressLine1" placeholder="Street address" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine2">Address Line 2</Label>
        <Input id="addressLine2" placeholder="Apartment, suite, etc." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" placeholder="City" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" placeholder="State" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pincode">PIN Code</Label>
        <Input id="pincode" placeholder="PIN code" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
        <Textarea
          id="instructions"
          placeholder="Any specific instructions for delivery"
        />
      </div>

      <Button type="submit" className="w-full">
        Save Address
      </Button>
    </form>
  );
}

function AddressCard({ address }: { address: any }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-gray-500" />
            <span className="font-medium">{address.name}</span>
            {address.isDefault && (
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-600">
                Default
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Address</DialogTitle>
                </DialogHeader>
                <AddressForm />
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-1 text-gray-600">
          <p>{address.addressLine1}</p>
          {address.addressLine2 && <p>{address.addressLine2}</p>}
          <p>
            {address.city}, {address.state} - {address.pincode}
          </p>
          <p className="pt-2">Phone: {address.phone}</p>
        </div>

        {!address.isDefault && (
          <Button variant="outline" className="mt-4">
            Set as Default
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
