// components/AddToCartButton.tsx
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { type ButtonProps } from "@/components/ui/button";
import { useAddToCart } from "@/utils/useAddToCart";
import { type productVariants, type products } from "@/server/db/schema";
import { type InferSelectModel } from "drizzle-orm";

interface AddToCartButtonProps extends Omit<ButtonProps, "onClick"> {
  product: InferSelectModel<typeof products>;
  productVariant?: InferSelectModel<typeof productVariants>;
  quantity?: number;
  children?: React.ReactNode;
}

export function AddToCartButton({
  product,
  productVariant,
  quantity,
  children = "Add to Cart",
  ...buttonProps
}: AddToCartButtonProps) {
  const { handleAddToCart, isAdding } = useAddToCart({
    product,
    variant: productVariant,
    quantity,
  });

  return (
    <Button
      className="w-full"
      onClick={handleAddToCart}
      disabled={isAdding || product.availableQuantity < 1}
      {...buttonProps}
    >
      {isAdding ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding...
        </>
      ) : (
        children
      )}
    </Button>
  );
}
