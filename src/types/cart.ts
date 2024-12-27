// src/types/cart.ts

export interface CartItemProduct {
  name: string;
  featureImage: string | null;
  shortDesc: string | null;
}

export interface CartItemVariant {
  variantName: string;
  variantValue: string;
}

export interface CartItem {
  id: number;
  productId: number;
  variantId: number | null;
  quantity: number;
  price: number;
  product: CartItemProduct;
  variant: CartItemVariant | null;
}

export interface CartResponse {
  items: CartItem[];
}

// Input types for cart operations
export interface AddToCartInput {
  productId: number;
  variantId?: number | null;
  quantity: number;
}

export interface RemoveFromCartInput {
  productId: number;
  quantity: number;
}
