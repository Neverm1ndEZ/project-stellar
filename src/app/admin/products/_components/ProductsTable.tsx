// src/app/admin/products/_components/ProductsTable.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash,
  Package,
  Loader2,
} from "lucide-react";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";

export function ProductsTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );

  // Fetch products with react-query via tRPC
  const { data: products, isLoading } = api.admin.getProducts.useQuery();
  const deleteProduct = api.admin.deleteProduct.useMutation({
    onSuccess: () => {
      // Invalidate the products query to refresh the list
      utils.admin.getProducts.invalidate();
      setDeleteDialogOpen(false);
    },
  });

  // Filter products based on search query
  const filteredProducts = products?.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDeleteClick = (productId: number) => {
    setSelectedProductId(productId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedProductId) {
      await deleteProduct.mutate(selectedProductId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Search className="h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.featureImage ? (
                    <Image
                      src={product.featureImage}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      {product.shortDesc}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell className="text-right">
                  ₹{product.sellingPrice}
                  {product.originalPrice > product.sellingPrice && (
                    <div className="text-sm text-gray-500 line-through">
                      ₹{product.originalPrice}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div
                    className={cn(
                      "inline-flex rounded-full px-2 py-1 text-xs font-medium",
                      {
                        "bg-green-50 text-green-700":
                          product.availableQuantity > 10,
                        "bg-yellow-50 text-yellow-700":
                          product.availableQuantity <= 10 &&
                          product.availableQuantity > 0,
                        "bg-red-50 text-red-700":
                          product.availableQuantity === 0,
                      },
                    )}
                  >
                    {product.availableQuantity > 0
                      ? `${product.availableQuantity} in stock`
                      : "Out of stock"}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/products/${product.id}`}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:bg-red-50 focus:text-red-600"
                        onClick={() => handleDeleteClick(product.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteProduct.isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteProduct.isLoading}
            >
              {deleteProduct.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
