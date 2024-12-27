// src/hooks/useAddToCart.ts
"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import { useCartOperations } from "@/components/global/CartProvider";
import { type products, type productVariants } from "@/server/db/schema";

type Product = typeof products.$inferSelect;
type ProductVariant = typeof productVariants.$inferSelect;

interface UseAddToCartProps {
  product: Product;
  variant?: ProductVariant;
  quantity?: number;
}

export function useAddToCart({
  product,
  variant,
  quantity = 1,
}: UseAddToCartProps) {
  const [isAdding, setIsAdding] = useState(false);
  // Instead of directly accessing state.addItem, we use the cart operations
  const { addItem } = useCartOperations();

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);

      await addItem({
        productId: product.id,
        variantId: variant?.id ?? null,
        quantity,
        price: variant
          ? product.sellingPrice + (variant.additionalPrice ?? 0)
          : product.sellingPrice,
        product: {
          name: product.name,
          featureImage: product.featureImage,
          shortDesc: product.shortDesc,
        },
        variant: variant
          ? {
              variantName: variant.variantName,
              variantValue: variant.variantValue,
            }
          : null,
      });
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return {
    handleAddToCart,
    isAdding,
  };
}
