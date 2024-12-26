import { api } from "@/trpc/server";
import ProductGrid from "./_components/ProductGrid";

export default async function ProductsPage() {
  const productsList = await api.product.getAllProducts();

  return <ProductGrid products={productsList} />;
}
