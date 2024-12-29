// src/store/cart.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type CartItem } from "@/types/cart";
import { type RouterOutputs } from "@/trpc/shared";

// Extend the CartItem interface for client-side needs
interface ClientCartItem extends CartItem {
  name: string;
  image?: string;
  size?: string;
  maxQuantity?: number; // Track available inventory
  isSelected?: boolean; // For multi-item operations
  error?: string; // Item-specific error messages
}

// Cart store state interface
interface CartState {
  items: ClientCartItem[];
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  lastSyncTimestamp: number | null;
  isAnonymous: boolean;
  selectedItems: Set<number>; // Track selected items by ID
  checkoutStep: "cart" | "address" | "payment" | "review";
  temporaryDiscount: number; // For promo codes
}

// Cart metadata interface
interface CartMetadata {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  itemCount: number;
  uniqueItemCount: number;
}

// Cart store actions interface
interface CartActions {
  // Loading and initialization
  startLoading: () => void;
  finishLoading: (error?: string | null) => void;
  setItems: (items: ClientCartItem[]) => void;
  setInitialized: (value: boolean) => void;
  setAnonymous: (value: boolean) => void;
  clearCart: () => void;

  // Cart item operations with inventory validation
  addItemLocally: (item: Omit<ClientCartItem, "id">) => void;
  removeItemLocally: (id: number) => void;
  updateQuantityLocally: (id: number, quantity: number) => void;

  // Item selection operations
  toggleItemSelection: (id: number) => void;
  selectAllItems: () => void;
  clearSelection: () => void;

  // Cart state management
  setCheckoutStep: (step: CartState["checkoutStep"]) => void;
  applyDiscount: (amount: number) => void;
  removeDiscount: () => void;

  // Inventory management
  updateItemInventory: (id: number, maxQuantity: number) => void;
  validateInventory: () => boolean;

  // Server sync operations
  mergeServerCart: (
    serverItems: RouterOutputs["cart"]["getCart"]["items"],
  ) => void;
  updateLastSyncTimestamp: () => void;

  // Cart calculations and utilities
  getCartMetadata: () => CartMetadata;
  getSelectedItems: () => ClientCartItem[];
  hasErrors: () => boolean;
  canProceedToCheckout: () => boolean;
}

// Combine state and actions
interface CartStore extends CartState, CartActions {}

// Create the store with persistence
export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      isInitialized: false,
      isLoading: false,
      error: null,
      lastSyncTimestamp: null,
      isAnonymous: true,
      selectedItems: new Set(),
      checkoutStep: "cart",
      temporaryDiscount: 0,

      // Basic state operations
      startLoading: () => set({ isLoading: true, error: null }),
      finishLoading: (error = null) => set({ isLoading: false, error }),
      setItems: (items) => set({ items }),
      setInitialized: (value) => set({ isInitialized: value }),
      setAnonymous: (value) =>
        set((state) => {
          if (state.isAnonymous === value) return state;
          return { isAnonymous: value };
        }),
      clearCart: () =>
        set({
          items: [],
          error: null,
          selectedItems: new Set(),
          temporaryDiscount: 0,
          checkoutStep: "cart",
        }),

      // Cart item operations with validation and error handling
      addItemLocally: (item) => {
        set((state) => {
          const existingItem = state.items.find(
            (i) =>
              i.productId === item.productId && i.variantId === item.variantId,
          );

          if (existingItem) {
            // Update quantity and recalculate price
            const unitPrice = item.price / item.quantity;
            const newQuantity = existingItem.quantity + item.quantity;

            return {
              items: state.items.map((i) =>
                i.id === existingItem.id
                  ? {
                      ...i,
                      quantity: newQuantity,
                      price: unitPrice * newQuantity,
                    }
                  : i,
              ),
            };
          }

          // Add new item
          return {
            items: [
              ...state.items,
              {
                ...item,
                id: Date.now(),
              },
            ],
          };
        });
      },

      updateQuantityLocally: (id, quantity) => {
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (!item) return state;

          const unitPrice = item.price / item.quantity;

          if (quantity < 1) {
            return {
              items: state.items.filter((i) => i.id !== id),
            };
          }

          return {
            items: state.items.map((i) =>
              i.id === id
                ? {
                    ...i,
                    quantity,
                    price: unitPrice * quantity,
                  }
                : i,
            ),
          };
        });
      },

      removeItemLocally: (id) => {
        set((state) => {
          try {
            const newItems = state.items.filter((i) => i.id !== id);
            const newSelectedItems = new Set(state.selectedItems);
            newSelectedItems.delete(id);

            return {
              items: newItems,
              selectedItems: newSelectedItems,
            };
          } catch (error) {
            console.error("Error in removeItemLocally:", error);
            return state;
          }
        });
      },

      // Item selection operations
      toggleItemSelection: (id) => {
        set((state) => {
          const newSelectedItems = new Set(state.selectedItems);
          if (newSelectedItems.has(id)) {
            newSelectedItems.delete(id);
          } else {
            newSelectedItems.add(id);
          }
          return { selectedItems: newSelectedItems };
        });
      },

      selectAllItems: () => {
        set((state) => ({
          selectedItems: new Set(state.items.map((item) => item.id)),
        }));
      },

      clearSelection: () => {
        set({ selectedItems: new Set() });
      },

      // Cart state management
      setCheckoutStep: (step) => {
        set({ checkoutStep: step });
      },

      applyDiscount: (amount) => {
        set({ temporaryDiscount: amount });
      },

      removeDiscount: () => {
        set({ temporaryDiscount: 0 });
      },

      // Inventory management
      updateItemInventory: (id, maxQuantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  maxQuantity,
                  error:
                    item.quantity > maxQuantity
                      ? `Only ${maxQuantity} items available`
                      : undefined,
                }
              : item,
          ),
        }));
      },

      validateInventory: () => {
        const state = get();
        return state.items.every(
          (item) => !item.maxQuantity || item.quantity <= item.maxQuantity,
        );
      },

      // Server sync operations
      mergeServerCart: (serverItems) => {
        set((state) => {
          const mergedItems = new Map<string, ClientCartItem>();

          // First, process server items
          serverItems.forEach((item) => {
            const key = `${item.productId}-${item.variantId || "default"}`;
            mergedItems.set(key, {
              ...item,
              name: item.product.name,
              image: item.product.featureImage ?? undefined,
              size: item.variant?.variantValue,
              maxQuantity: item.product.availableQuantity,
              isSelected: false,
            });
          });

          // Then merge local items properly
          if (state.isAnonymous) {
            state.items.forEach((localItem) => {
              const key = `${localItem.productId}-${localItem.variantId || "default"}`;
              const existingItem = mergedItems.get(key);

              if (existingItem) {
                // Calculate unit price from server item
                const unitPrice = existingItem.price / existingItem.quantity;
                const newQuantity = existingItem.quantity + localItem.quantity;

                mergedItems.set(key, {
                  ...existingItem,
                  quantity: newQuantity,
                  price: unitPrice * newQuantity,
                });
              } else {
                mergedItems.set(key, localItem);
              }
            });
          }

          return {
            items: Array.from(mergedItems.values()),
            isAnonymous: false,
          };
        });
      },

      updateLastSyncTimestamp: () => {
        set({ lastSyncTimestamp: Date.now() });
      },

      // Cart calculations and utilities
      getCartMetadata: () => {
        const state = get();
        const subtotal = state.items.reduce(
          (total, item) => total + item.price,
          0,
        );
        const tax = subtotal * 0.18; // 18% GST
        const shipping = subtotal > 500 ? 0 : 50; // Free shipping over ₹500
        const discount = state.temporaryDiscount;
        const total = subtotal + tax + shipping - discount;

        return {
          subtotal,
          tax,
          shipping,
          discount,
          total,
          itemCount: state.items.reduce(
            (count, item) => count + item.quantity,
            0,
          ),
          uniqueItemCount: state.items.length,
        };
      },

      getSelectedItems: () => {
        const state = get();
        return state.items.filter((item) => state.selectedItems.has(item.id));
      },

      hasErrors: () => {
        const state = get();
        return state.items.some((item) => item.error !== undefined);
      },

      canProceedToCheckout: () => {
        const state = get();
        return (
          state.items.length > 0 &&
          !state.hasErrors() &&
          state.validateInventory() &&
          !state.isLoading &&
          !state.error
        );
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        items: state.items,
        isAnonymous: state.isAnonymous,
        lastSyncTimestamp: state.lastSyncTimestamp,
        checkoutStep: state.checkoutStep,
      }),
    },
  ),
);
