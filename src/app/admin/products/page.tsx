// src/app/admin/products/page.tsx
import { ProductsTable } from "./_components/ProductsTable";

export default function ProductsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <p className="text-gray-600">
          Manage your products, inventory, and pricing
        </p>
      </div>

      <ProductsTable />
    </div>
  );
}
