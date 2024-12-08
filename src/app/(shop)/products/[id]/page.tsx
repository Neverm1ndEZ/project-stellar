// app/(shop)/products/[id]/page.tsx
import { Suspense, use } from "react";
import { ProductDetail } from "@/components/products/ProductDetail";
import { getProduct } from "@/lib/services/product";

function LoadingState() {
	return (
		<div className="container py-8">
			<div className="animate-pulse">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div className="aspect-square bg-gray-200 rounded-lg" />
					<div className="space-y-4">
						<div className="h-8 bg-gray-200 rounded w-3/4" />
						<div className="h-4 bg-gray-200 rounded w-full" />
						<div className="h-6 bg-gray-200 rounded w-1/4" />
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
