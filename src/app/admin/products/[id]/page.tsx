// src/app/admin/products/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { ProductForm } from "../_components/ProductsForm";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";

export default function EditProductPage() {
  const params = useParams();
  const productId = parseInt(params.id as string);

  const { data: product, isLoading } = api.admin.getProduct.useQuery({
    id: productId,
  });

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-gray-500">Product not found</p>
      </div>
    );
  }

  const formattedProduct = {
    ...product,
    originalPrice: product.originalPrice.toString(),
    sellingPrice: product.sellingPrice.toString(),
    availableQuantity: product.availableQuantity.toString(),
    categoryId: product.categoryId.toString(),
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
        <p className="text-gray-600">Update the product details below</p>
      </div>

      <ProductForm initialData={formattedProduct} />
    </div>
  );
}
