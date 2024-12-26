// app/(shop)/products/[id]/page.tsx
import { Suspense, use } from "react";
import { ProductDetail } from "@/app/(shop)/products/_components/ProductDetail";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";

// In Next.js 15, params are properly typed by the framework
interface PageProps {
  params: {
    id: string;
  };
}

// Loading state component remains the same for consistency
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

// Metadata generation using Next.js 15's more robust types
export async function generateMetadata({ params }: PageProps) {
  const productId = Number(params.id);
  try {
    const product = await api.product.getProductById(productId);

    return {
      title: product.name,
      description: product.shortDesc,
      openGraph: {
        title: product.name,
        description: product.shortDesc,
        images: [product.featureImage],
      },
    };
  } catch {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found",
    };
  }
}

// Main page component with Next.js 15's handling of dynamic segments
export default async function ProductDetailPage({ params }: PageProps) {
  // Next.js 15 ensures params.id is always a string, so we can safely convert it
  const productId = parseInt(params.id);

  try {
    const product = await api.product.getProductById(productId);

    // If the product doesn't exist, show the 404 page
    if (!product) {
      notFound();
    }

    return (
      <main className="min-h-screen">
        <Suspense fallback={<LoadingState />}>
          <ProductDetail product={product} />
        </Suspense>
      </main>
    );
  } catch (error) {
    // Log the error for debugging but show a user-friendly 404 page
    console.error("Failed to fetch product:", error);
    notFound();
  }
}
