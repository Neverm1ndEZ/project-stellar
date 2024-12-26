// components/products/ProductDetail.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { type products } from "@/server/db/schema";
import { EnhancedReviewSection } from "./EnhancedReviewSection";

type Product = typeof products.$inferSelect;

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCart((state) => state.addItem);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      quantity,
      price: product.sellingPrice * quantity,
      product: {
        name: product.name,
        featureImage: product.featureImage,
        shortDesc: product.shortDesc,
      },
    });
  };

  // Calculate savings percentage
  const savingsPercent = Math.round(
    ((product.originalPrice - product.sellingPrice) / product.originalPrice) *
      100,
  );

  return (
    <div className="container py-8">
      <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg">
            <Image
              src={"https://placeholder.pagebee.io/api/plain/600/600"}
              alt={product.name}
              className="h-full w-full object-cover"
              width={600}
              height={600}
              priority
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="mt-2 text-gray-600">{product.longDesc}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-brand-600 text-2xl font-bold">
                ₹{product.sellingPrice}
              </span>
              {product.originalPrice > product.sellingPrice && (
                <>
                  <span className="text-gray-500 line-through">
                    ₹{product.originalPrice}
                  </span>
                  <span className="text-green-600">
                    ({savingsPercent}% off)
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!product.availableQuantity}
                >
                  -
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setQuantity(
                      Math.min(product.availableQuantity ?? 0, quantity + 1),
                    )
                  }
                  disabled={!product.availableQuantity}
                >
                  +
                </Button>
              </div>
              {product.availableQuantity && product.availableQuantity < 10 && (
                <p className="text-sm text-orange-600">
                  Only {product.availableQuantity} left in stock!
                </p>
              )}
            </div>

            <Button
              className="w-full"
              onClick={handleAddToCart}
              disabled={!product.availableQuantity}
            >
              {product.availableQuantity
                ? `Add to Cart - ₹${product.sellingPrice * quantity}`
                : "Out of Stock"}
            </Button>
          </div>

          <Tabs defaultValue="details">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">
                Details
              </TabsTrigger>
              <TabsTrigger value="storage" className="flex-1">
                Storage
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4">
              <div>
                <h3 className="font-medium">Product Details</h3>
                <p className="text-gray-600">{product.longDesc}</p>
              </div>
            </TabsContent>
            <TabsContent value="storage">
              <div className="space-y-2">
                <p className="text-gray-600">
                  Store in a cool, dry place away from direct sunlight.
                </p>
                <p className="text-gray-600">
                  Refrigerate after opening and consume within 6 months.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <div>
        <EnhancedReviewSection
          productId={product.id}
          // currentUserId={getCurrentUserId()}
          // hasOrderHistory={hasOrderHistory()}
        />
      </div>
    </div>
  );
}
