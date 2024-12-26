import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  id: number;
  productId: number;
  variantId?: number | null;
  // Keep these fields so that the UI works as-is
  name: string;
  size: string;
  quantity: number;
  /**
   * IMPORTANT: This should be the unit price (price per item),
   * not price * quantity.
   */
  price: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],

      // Add item with unit price. If it already exists (same product/variant),
      // just update the quantity. Do NOT recalc price x quantity.
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find(
            (i) =>
              i.productId === item.productId && i.variantId === item.variantId,
          );

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            };
          }

          return {
            items: [...state.items, { ...item, id: Date.now() }],
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      // Update only the quantity field. Do not recalc `price`.
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
