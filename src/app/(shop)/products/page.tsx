"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/store/cart";
import Link from "next/link";

export default function ProductsPage() {
  const [filter, setFilter] = useState({
    category: "all",
    spiceLevel: "all",
    sortBy: "popular",
  });
  const addToCart = useCart((state) => state.addItem);

  // In a real app, this would come from an API
  const products = [
    {
      id: "1",
      name: "Mango Thokku",
      description: "Spicy and tangy mango pickle made with fresh raw mangoes",
      price: 199,
      category: "mango",
      spiceLevel: "medium" as const,
      images: ["https://placeholder.pagebee.io/api/plain/400/300"],
      size: "250g",
      inStock: true,
      ingredients: ["Raw Mango", "Salt", "Red Chilli", "Mustard"],
    },
    // Add more products...
  ];

  return (
    <div className="container py-8">
      <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
        {/* Filters */}
        <div className="w-full space-y-4 md:w-64">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select
              value={filter.category}
              onValueChange={(value) =>
                setFilter({ ...filter, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="mango">Mango Varieties</SelectItem>
                <SelectItem value="citrus">Lemon & Citrus</SelectItem>
                <SelectItem value="mixed">Mixed Vegetables</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Spice Level</label>
            <Select
              value={filter.spiceLevel}
              onValueChange={(value) =>
                setFilter({ ...filter, spiceLevel: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select spice level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="mild">Mild</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sort By</label>
            <Select
              value={filter.sortBy}
              onValueChange={(value) => setFilter({ ...filter, sortBy: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card
                key={product.id}
                className="group cursor-pointer overflow-hidden"
              >
                {/* Wrap the clickable content in Link */}
                <Link href={`/products/${product.id}`}>
                  <div className="transition-transform group-hover:scale-[1.02]">
                    <img
                      src={
                        product.images[0] ||
                        "https://placeholder.pagebee.io/api/plain/400/300"
                      }
                      alt={product.name}
                      className="h-48 w-full object-cover"
                    />
                    <CardContent className="p-6">
                      <h3 className="mb-2 text-xl font-semibold">
                        {product.name}
                      </h3>
                      <p className="mb-4 text-gray-600">
                        {product.description}
                      </p>
                      <p className="text-brand-600 text-xl font-bold">
                        ₹{product.price}
                      </p>
                    </CardContent>
                  </div>
                </Link>
                <CardFooter className="p-6 pt-0">
                  <Button
                    className="w-full"
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart({ ...product, quantity: 1 });
                    }}
                  >
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
