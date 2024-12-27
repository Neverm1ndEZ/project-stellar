"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { AddToCartButton } from "./AddToCartButton";
import { type products } from "@/server/db/schema";
import { type InferSelectModel } from "drizzle-orm";
import Link from "next/link";

interface ProductCardProps {
  product: InferSelectModel<typeof products>;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden">
      <Link href={`/products/${product.id}`}>
        <Image
          src={
            `${product.featureImage}` ||
            `https://placeholder.pagebee.io/api/plain/400/300`
          }
          alt={product.name}
          className="h-48 w-full object-cover"
          width={192}
          height={144}
        />
        <CardContent className="p-6">
          <h3 className="mb-2 text-xl font-semibold">{product.name}</h3>
          <p className="mb-4 text-gray-600">{product.shortDesc}</p>
          <p className="text-brand-600 text-xl font-bold">
            ₹{product.sellingPrice}
          </p>
        </CardContent>
      </Link>
      <CardFooter className="p-6 pt-0">
        <AddToCartButton product={product} />
      </CardFooter>
    </Card>
  );
}
