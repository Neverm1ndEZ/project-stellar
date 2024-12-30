// src/app/(shop)/checkout/_components/AddressSelector/index.tsx
"use client";

import { useState } from "react";
import { AddressCard } from "./AddressCard";
import { NewAddressForm } from "./NewAddressForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { api } from "@/trpc/react";
import { type addresses as AddressType } from "@/server/db/schema";
import AddressSelectorSkeleton from "./AddressSelectorSkeleton";

interface AddressSelectorProps {
  selectedAddresses: {
    shipping: number;
    billing: number;
  };
  onSelectAddress: (addressId: number, type: typeof AddressType) => void;
  errors: Record<string, string>;
}

export function AddressSelector({
  selectedAddresses,
  onSelectAddress,
  errors,
}: AddressSelectorProps) {
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const { data: addresses, isLoading, refetch } =
    api.address.getUserAddresses.useQuery();

  if (isLoading) {
    return <AddressSelectorSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Select Delivery Address</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNewAddressForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Address
        </Button>
      </div>

      {showNewAddressForm ? (
        <NewAddressForm
          onSuccess={(addressId) => {
            setShowNewAddressForm(false);
            void refetch();
            onSelectAddress(addressId, "shipping");
          }}
          onCancel={() => setShowNewAddressForm(false)}
        />
      ) : (
        <div className="space-y-4">
          <div className="space-y-4">
            {addresses?.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                isSelected={selectedAddresses.shipping === address.id}
                onClick={() => onSelectAddress(address.id, "shipping")}
              />
            ))}
          </div>

          {errors.shipping && (
            <p className="text-sm text-red-500">{errors.shipping}</p>
          )}
        </div>
      )}
    </div>
  );
}
