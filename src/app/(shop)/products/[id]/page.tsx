// app/(shop)/products/[id]/page.tsx
import { Suspense, use } from "react";
import { ProductDetail } from "@/components/products/ProductDetail";
import { getProduct } from "@/hooks/product";

function LoadingState() {
  return (
    <div className="container py-8">
      <div className="animate-pulse">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="aspect-square rounded-lg bg-gray-200" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-6 w-1/4 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<LoadingState />}>
      <ProductDetailPageContent params={params} />
    </Suspense>
  );
}

function ProductDetailPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const product = use(getProduct(resolvedParams.id));

  return <ProductDetail product={product} />;
}
