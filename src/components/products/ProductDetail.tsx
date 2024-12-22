// components/products/ProductDetail.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Product, type CartProduct } from "@/types/product";
import { ReviewsSection } from "./ReviewsSection";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCart((state) => state.addItem);

  const handleAddToCart = () => {
    const cartItem: CartProduct = {
      ...product,
      size: selectedSize,
      quantity,
    };
    addToCart(cartItem);
  };

  return (
    <div className="container py-8">
      <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg">
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="mt-2 text-gray-600">{product.description}</p>
          </div>

          <div className="text-brand-600 text-2xl font-bold">
            ₹{product.price}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Size</label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {product.sizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              {product.inStock
                ? `Add to Cart - ₹${product.price * quantity}`
                : "Out of Stock"}
            </Button>
          </div>

          <Tabs defaultValue="details">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">
                Details
              </TabsTrigger>
              <TabsTrigger value="ingredients" className="flex-1">
                Ingredients
              </TabsTrigger>
              <TabsTrigger value="storage" className="flex-1">
                Storage
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4">
              <div>
                <h3 className="font-medium">Spice Level</h3>
                <p className="capitalize text-gray-600">{product.spiceLevel}</p>
              </div>
              <div>
                <h3 className="font-medium">Shelf Life</h3>
                <p className="text-gray-600">{product.shelfLife}</p>
              </div>
            </TabsContent>
            <TabsContent value="ingredients">
              <p className="text-gray-600">{product.ingredients.join(", ")}</p>
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

      {/* Reviews section */}
      <div className="border-t pt-12">
        <h2 className="mb-8 text-2xl font-bold">Customer Reviews</h2>
        <ReviewsSection product={product} />
      </div>
    </div>
  );
}
