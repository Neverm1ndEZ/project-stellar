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
          try {
            const unitPrice = Number(item.price);

            console.log("Adding item:", {
              incomingItemPrice: unitPrice,
              incomingItemQuantity: item.quantity,
              productId: item.productId,
            });

            // Validate available quantity
            if (
              item.maxQuantity !== undefined &&
              item.quantity > item.maxQuantity
            ) {
              return {
                items: state.items,
                error: `Only ${item.maxQuantity} items available`,
              };
            }

            const existingItem = state.items.find(
              (i) =>
                i.productId === item.productId &&
                i.variantId === item.variantId,
            );

            if (existingItem) {
              const newQuantity = existingItem.quantity + item.quantity;

              console.log("Updating existing item:", {
                existingItemPrice: existingItem.price,
                existingItemQuantity: existingItem.quantity,
                newQuantity,
                calculatedNewPrice: item.price * newQuantity,
              });

              // Check combined quantity against inventory
              if (
                existingItem.maxQuantity !== undefined &&
                newQuantity > existingItem.maxQuantity
              ) {
                return {
                  items: state.items.map((i) =>
                    i.id === existingItem.id
                      ? {
                          ...i,
                          error: `Cannot add more than ${existingItem.maxQuantity} items`,
                        }
                      : i,
                  ),
                };
              }

              return {
                items: state.items.map((i) =>
                  i.productId === item.productId &&
                  i.variantId === item.variantId
                    ? {
                        ...i,
                        quantity: newQuantity,
                        price: item.price * newQuantity, // Use item.price directly as it's the unit price
                        error: undefined,
                      }
                    : i,
                ),
              };
            } else {
              console.log("Creating new item:", {
                price: item.price,
                quantity: item.quantity,
                totalPrice: item.price * item.quantity,
              });
            }

            const newItem: ClientCartItem = {
              ...item,
              price: unitPrice * item.quantity, // Now we're multiplying numbers
              id: Date.now(),
              name: item.product.name,
              size: item.variant?.variantValue,
              image: item.product.featureImage ?? undefined,
              isSelected: false,
              error: undefined,
            };
            // In addItemLocally when handling existing items:

            return { items: [...state.items, newItem] };
          } catch (error) {
            console.error("Error in addItemLocally:", error);
            return { ...state, error: "Failed to add item to cart" };
          }
        });
      },

      updateQuantityLocally: (id, quantity) => {
        set((state) => {
          try {
            const item = state.items.find((i) => i.id === id);
            if (!item) return state;

            // Calculate unit price from current item's total price and quantity
            const unitPrice = item.price / item.quantity;

            // Validate against inventory
            if (item.maxQuantity !== undefined && quantity > item.maxQuantity) {
              return {
                items: state.items.map((i) =>
                  i.id === id
                    ? { ...i, error: `Cannot exceed ${item.maxQuantity} items` }
                    : i,
                ),
              };
            }

            if (quantity < 1) {
              const newSelectedItems = new Set(state.selectedItems);
              newSelectedItems.delete(id);
              return {
                items: state.items.filter((i) => i.id !== id),
                selectedItems: newSelectedItems,
              };
            }

            // In updateQuantityLocally:
            console.log({
              currentPrice: item.price,
              currentQuantity: item.quantity,
              calculatedUnitPrice: unitPrice,
              newQuantity: quantity,
              newTotalPrice: unitPrice * quantity,
            });

            return {
              items: state.items.map((i) =>
                i.id === id
                  ? {
                      ...i,
                      quantity,
                      price: unitPrice * quantity, // Use the calculated unit price
                      error: undefined,
                    }
                  : i,
              ),
            };
          } catch (error) {
            console.error("Error in updateQuantityLocally:", error);
            return state;
          }
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
          try {
            const transformedServerItems = serverItems.map(
              (item): ClientCartItem => ({
                ...item,
                name: item.product.name,
                image: item.product.featureImage ?? undefined,
                size: item.variant?.variantValue,
                isSelected: false,
                maxQuantity: undefined,
                error: undefined,
              }),
            );

            if (state.isAnonymous) {
              const mergedItems = [...transformedServerItems];

              state.items.forEach((localItem) => {
                const serverItem = transformedServerItems.find(
                  (i) =>
                    i.productId === localItem.productId &&
                    i.variantId === localItem.variantId,
                );

                if (!serverItem) {
                  mergedItems.push(localItem);
                } else {
                  const index = mergedItems.findIndex(
                    (i) => i.id === serverItem.id,
                  );
                  if (index !== -1) {
                    mergedItems[index] = {
                      ...serverItem,
                      quantity: serverItem.quantity + localItem.quantity,
                      price:
                        (serverItem.price / serverItem.quantity) *
                        (serverItem.quantity + localItem.quantity),
                    };
                  }
                }
              });

              return {
                items: mergedItems,
                isAnonymous: false,
                selectedItems: new Set(),
              };
            }

            return {
              items: transformedServerItems,
              isAnonymous: false,
              selectedItems: new Set(),
            };
          } catch (error) {
            console.error("Error in mergeServerCart:", error);
            return state;
          }
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
