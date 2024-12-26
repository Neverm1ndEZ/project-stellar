"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import { type products, type productVariants } from "@/server/db/schema";

// Define the expected product type from the database
type Product = typeof products.$inferSelect;
type ProductVariant = typeof productVariants.$inferSelect;

// Props that the hook will accept
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
  const addToCart = useCart((state) => state.addItem);

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);

      // Prepare the cart item based on our cart store structure
      const cartItem = {
        productId: product.id,
        variantId: variant?.id ?? null,
        quantity,
        // Convert price to cents if needed
        price: variant
          ? product.sellingPrice + (variant.additionalPrice ?? 0)
          : product.sellingPrice,
        // Include required product details for UI
        product: {
          name: product.name,
          featureImage: product.featureImage,
          shortDesc: product.shortDesc,
        },
        // Include variant details if present
        variant: variant
          ? {
              variantName: variant.variantName,
              variantValue: variant.variantValue,
            }
          : null,
      };

      addToCart(cartItem);

      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      // Handle error (show toast, etc.)
    } finally {
      setIsAdding(false);
    }
  };

  return {
    handleAddToCart,
    isAdding,
  };
}
