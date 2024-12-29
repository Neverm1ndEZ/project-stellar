// src/app/(shop)/checkout/_components/AddressSelector/AddressCard.tsx
"use client";

import { MapPin } from "lucide-react";
import { type addresses } from "@/server/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AddressCardProps {
  address: typeof addresses;
  isSelected: boolean;
  onClick: () => void;
}

export function AddressCard({
  address,
  isSelected,
  onClick,
}: AddressCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-brand-500 ring-2",
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <MapPin className="mt-1 h-5 w-5 shrink-0 text-gray-400" />
          <div className="space-y-1">
            <p className="font-medium">{address.type}</p>
            <p className="text-sm text-gray-500">
              {address.addressLineOne}
              {address.addressLineTwo && `, ${address.addressLineTwo}`}
            </p>
            <p className="text-sm text-gray-500">
              {address.city}, {address.state} {address.postalCode}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
