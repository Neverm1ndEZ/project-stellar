"use client";

import { AddToCartButton } from "@/app/_components/AddToCartButton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type products } from "@/server/db/schema";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ProductGridProps {
  products: (typeof products.$inferSelect)[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [filter, setFilter] = useState({
    category: "all",
    spiceLevel: "all",
    sortBy: "popular",
  });

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
                <Link href={`/products/${product.id}`}>
                  <div className="transition-transform group-hover:scale-[1.02]">
                    <Image
                      src={
                        product.featureImage ||
                        "https://placeholder.pagebee.io/api/plain/400/300"
                      }
                      alt={product.name}
                      className="h-48 w-full object-cover"
                      height={192}
                      width={88}
                    />
                    <CardContent className="p-6">
                      <h3 className="mb-2 text-xl font-semibold">
                        {product.name}
                      </h3>
                      <p className="mb-4 text-gray-600">{product.shortDesc}</p>
                      <p className="text-brand-600 text-xl font-bold">
                        ₹{product.sellingPrice}
                      </p>
                    </CardContent>
                  </div>
                </Link>
                <CardFooter className="p-6 pt-0">
                  <AddToCartButton product={product} />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
