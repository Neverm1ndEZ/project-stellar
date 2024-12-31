// src/app/admin/products/_components/ProductForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import { Loader2, ImagePlus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Image from "next/image";

// Form validation schema
const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  shortDesc: z.string().min(1, "Short description is required"),
  longDesc: z.string().min(1, "Long description is required"),
  sku: z.string().min(1, "SKU is required"),
  categoryId: z.string().min(1, "Category is required"),
  originalPrice: z.string().min(1, "Original price is required"),
  sellingPrice: z.string().min(1, "Selling price is required"),
  availableQuantity: z.string().min(1, "Available quantity is required"),
  featureImage: z.string().url("Feature image must be a valid URL"),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: ProductFormValues;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const { data: categories } = api.admin.getCategories.useQuery();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData ?? {
      name: "",
      shortDesc: "",
      longDesc: "",
      sku: "",
      categoryId: "",
      originalPrice: "",
      sellingPrice: "",
      availableQuantity: "",
      featureImage: "",
    },
  });

  const createProduct = api.admin.createProduct.useMutation({
    onSuccess: () => {
      router.push("/admin/products");
      router.refresh();
    },
  });

  const updateProduct = api.admin.updateProduct.useMutation({
    onSuccess: () => {
      router.push("/admin/products");
      router.refresh();
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    if (initialData) {
      await updateProduct.mutateAsync({
        id: initialData.id,
        ...data,
      });
    } else {
      await createProduct.mutateAsync(data);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Implement your image upload logic here
      // For example, using uploadthing or any other service
      const imageUrl = await uploadImage(file);
      form.setValue("featureImage", imageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details of your product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shortDesc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brief description for product listings"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longDesc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Long Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed product description"
                        className="h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
              <CardDescription>
                Manage product pricing and stock levels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="originalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Price (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sellingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selling Price (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter SKU" {...field} />
                    </FormControl>
                    <FormDescription>
                      A unique identifier for your product
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="availableQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Product Image */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
              <CardDescription>Upload the main product image</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="featureImage"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-4">
                      {field.value ? (
                        <div className="relative h-40 w-40">
                          <Image
                            src={field.value}
                            alt="Product image"
                            fill
                            className="rounded-lg object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-40 w-40 items-center justify-center rounded-lg border-2 border-dashed border-gray-200">
                          <ImagePlus className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isUploading}
                          />
                        </FormControl>
                        <FormDescription>
                          Upload a high-quality product image. Recommended size:
                          800x800px
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={form.formState.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || isUploading}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{initialData ? "Update Product" : "Create Product"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
