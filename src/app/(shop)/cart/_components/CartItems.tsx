// src/app/(shop)/cart/_components/CartItems.tsx
"use client";

import { useCart } from "@/store/cart";
import { useCartOperations } from "@/components/global/CartProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

export function CartItems() {
  const { items, isLoading } = useCart();
  const { updateQuantity, removeItem } = useCartOperations();

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="flex items-center p-4">
            <Image
              src={item.image ?? "/placeholder.png"}
              alt={item.name}
              className="h-24 w-24 rounded object-cover"
              width={96}
              height={96}
            />
            <div className="ml-4 flex-grow">
              <h3 className="font-medium">{item.name}</h3>
              {item.size && <p className="text-gray-600">Size: {item.size}</p>}
              <p className="text-brand-600 font-bold">₹{item.price}</p>

              <div className="mt-2 flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    updateQuantity(item.id, Math.max(1, item.quantity - 1))
                  }
                  disabled={isLoading}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="mx-4 w-8 text-center">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-600"
              onClick={() => removeItem(item.id)}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
