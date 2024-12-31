// src/app/admin/products/new/page.tsx
import { ProductForm } from "../_components/ProductsForm";

export default function NewProductPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">New Product</h2>
        <p className="text-gray-600">
          Create a new product by filling out the details below
        </p>
      </div>

      <ProductForm />
    </div>
  );
}
