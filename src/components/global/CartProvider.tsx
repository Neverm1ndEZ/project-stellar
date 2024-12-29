// src/components/providers/CartProvider.tsx
"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/store/cart";
import { api } from "@/trpc/react";
import { type CartItem } from "@/types/cart";
import { useToast } from "@/hooks/use-toast";

/**
 * Custom hook for managing cart operations with advanced features
 * Handles both anonymous and authenticated cart states
 */
export function useCartOperations() {
  const { toast } = useToast();
  const utils = api.useUtils();

  // Cart store actions
  const {
    items,
    isAnonymous,
    setItems,
    setInitialized,
    startLoading,
    finishLoading,
    addItemLocally,
    removeItemLocally,
    updateQuantityLocally,
    mergeServerCart,
    updateLastSyncTimestamp,
    updateItemInventory,
    validateInventory,
    hasErrors,
    getCartMetadata,
  } = useCart();

  // tRPC queries and mutations
  const getCartQuery = api.cart.getCart.useQuery(undefined, {
    enabled: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30000,
  });

  const addToCartMutation = api.cart.addToCart.useMutation({
    onSuccess: () => {
      void utils.cart.getCart.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error adding item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeFromCartMutation = api.cart.removeFromCart.useMutation({
    onSuccess: () => {
      void utils.cart.getCart.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error removing item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  /**
   * Check product inventory levels before cart operations
   * Updates local inventory state and validates quantities
   */
  const validateAndUpdateInventory = useCallback(
    async (productId: number) => {
      try {
        // First check if we need to validate inventory (anonymous users might not need to)
        if (isAnonymous) {
          return true; // Skip inventory validation for anonymous users
        }

        const inventoryData = await utils.client.product.getInventory.query({
          productId,
        });

        const itemsToUpdate = items.filter(
          (item) => item.productId === productId,
        );
        itemsToUpdate.forEach((item) => {
          updateItemInventory(item.id, inventoryData.availableQuantity);
        });

        return validateInventory();
      } catch (error) {
        console.error("Error validating inventory:", error);
        // If inventory check fails, we'll be conservative and assume it's valid
        // You might want to adjust this based on your business requirements
        return true;
      }
    },
    [
      isAnonymous,
      items,
      updateItemInventory,
      validateInventory,
      utils.client.product.getInventory,
    ],
  );

  /**
   * Synchronize cart with server
   * Implements exponential backoff retry strategy and handles inventory validation
   */
  const syncWithServer = useCallback(
    async (retryCount = 3) => {
      if (isAnonymous) return;

      startLoading();

      try {
        const result = await getCartQuery.refetch();
        if (result.error) throw result.error;

        if (result.data) {
          // Update inventory data for all items
          const inventoryPromises = result.data.items.map((item) =>
            validateAndUpdateInventory(item.productId),
          );
          await Promise.all(inventoryPromises);

          mergeServerCart(result.data.items);
        }

        setInitialized(true);
        updateLastSyncTimestamp();
        finishLoading();

        // Show warning if any inventory issues were found
        if (hasErrors()) {
          toast({
            title: "Cart Updated",
            description:
              "Some items quantities were adjusted due to inventory changes",
            variant: "warning",
          });
        }
      } catch (error) {
        console.error("Failed to sync cart:", error);

        if (retryCount > 0) {
          const delay = Math.min(1000 * 2 ** (3 - retryCount), 30000);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return syncWithServer(retryCount - 1);
        }

        finishLoading(
          error instanceof Error ? error.message : "Failed to sync cart",
        );

        toast({
          title: "Cart sync failed",
          description: "Please try again later",
          variant: "destructive",
        });
      }
    },
    [
      isAnonymous,
      getCartQuery,
      validateAndUpdateInventory,
      mergeServerCart,
      setInitialized,
      updateLastSyncTimestamp,
      startLoading,
      finishLoading,
      hasErrors,
      toast,
    ],
  );

  /**
   * Add item to cart with inventory validation and optimistic updates
   */
  // Modify the addItem function to be more resilient
  const addItem = useCallback(
    async (item: Omit<CartItem, "id">) => {
      startLoading();

      try {
        // For anonymous users or if inventory validation fails, proceed with adding item
        const isValidInventory = await validateAndUpdateInventory(
          item.productId,
        );

        if (!isValidInventory && !isAnonymous) {
          throw new Error("Insufficient inventory");
        }

        // Optimistic update
        addItemLocally(item);

        if (!isAnonymous) {
          await addToCartMutation.mutateAsync({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          });
        }

        const { itemCount } = getCartMetadata();
        toast({
          title: "Item added to cart",
          description: `Cart now has ${itemCount} item${itemCount !== 1 ? "s" : ""}`,
        });

        finishLoading();
      } catch (error) {
        console.error("Failed to add item:", error);
        finishLoading(
          error instanceof Error ? error.message : "Failed to add item",
        );
        await syncWithServer();
        throw error;
      }
    },
    [
      isAnonymous,
      addToCartMutation,
      addItemLocally,
      validateAndUpdateInventory,
      syncWithServer,
      startLoading,
      finishLoading,
      getCartMetadata,
      toast,
    ],
  );

  /**
   * Remove item from cart with optimistic updates
   * Handles both single item and bulk removal
   */
  const removeItem = useCallback(
    async (ids: number | number[]) => {
      const itemsToRemove = Array.isArray(ids) ? ids : [ids];
      const items = useCart.getState().items;

      startLoading();

      try {
        // Optimistic update for all items
        itemsToRemove.forEach((id) => removeItemLocally(id));

        if (!isAnonymous) {
          // Process server updates sequentially to maintain order
          for (const id of itemsToRemove) {
            const item = items.find((item) => item.id === id);
            if (item) {
              await removeFromCartMutation.mutateAsync({
                productId: item.productId,
                quantity: item.quantity,
              });
            }
          }
        }

        const itemCount = itemsToRemove.length;
        toast({
          title: `${itemCount} item${itemCount !== 1 ? "s" : ""} removed`,
          description: "Cart updated successfully",
        });

        finishLoading();
      } catch (error) {
        console.error("Failed to remove items:", error);
        finishLoading(
          error instanceof Error ? error.message : "Failed to remove items",
        );
        await syncWithServer();
        throw error;
      }
    },
    [
      isAnonymous,
      removeFromCartMutation,
      removeItemLocally,
      syncWithServer,
      startLoading,
      finishLoading,
      toast,
    ],
  );

  /**
   * Update item quantity with inventory validation and optimistic updates
   */
  const updateQuantity = useCallback(
    async (id: number, newQuantity: number) => {
      const item = items.find((item) => item.id === id);
      if (!item) return;

      // If new quantity is less than 1, this should be handled by the component
      if (newQuantity < 1) {
        throw new Error("Invalid quantity: Must be greater than 0");
      }

      startLoading();

      try {
        // Validate inventory for new quantity
        const isValidInventory = await validateAndUpdateInventory(
          item.productId,
        );
        if (!isValidInventory) {
          throw new Error("Insufficient inventory");
        }

        // Optimistic update
        updateQuantityLocally(id, newQuantity);

        if (!isAnonymous) {
          if (newQuantity > item.quantity) {
            // Increasing quantity
            await addToCartMutation.mutateAsync({
              productId: item.productId,
              variantId: item.variantId,
              quantity: newQuantity - item.quantity,
            });
          } else {
            // Decreasing quantity
            await removeFromCartMutation.mutateAsync({
              productId: item.productId,
              quantity: item.quantity - newQuantity,
            });
          }
        }

        finishLoading();
      } catch (error) {
        console.error("Failed to update quantity:", error);
        finishLoading(
          error instanceof Error ? error.message : "Failed to update quantity",
        );
        await syncWithServer();
        throw error;
      }
    },
    [
      items,
      isAnonymous,
      addToCartMutation,
      removeFromCartMutation,
      updateQuantityLocally,
      validateAndUpdateInventory,
      syncWithServer,
      startLoading,
      finishLoading,
    ],
  );

  return {
    syncWithServer,
    addItem,
    removeItem,
    updateQuantity,
  };
}

/**
 * Custom hook for handling cart synchronization during authentication changes
 */
export function useCartSync() {
  const { data: session } = useSession();
  const utils = api.useUtils();
  const { toast } = useToast();

  const {
    items,
    isAnonymous,
    setAnonymous,
    mergeServerCart,
    updateLastSyncTimestamp,
    validateInventory,
    hasErrors,
  } = useCart();

  // tRPC mutation for syncing anonymous cart
  const syncCartMutation = api.cart.addToCart.useMutation({
    onSuccess: () => {
      void utils.cart.getCart.invalidate();
    },
  });

  /**
   * Synchronize anonymous cart with server after user login
   * Handles inventory validation and conflict resolution
   */
  const syncAnonymousCart = useCallback(async () => {
    if (!session || !isAnonymous || items.length === 0) return;

    try {
      // First, get the existing server cart
      const serverCart = await utils.client.cart.getCart.query();

      // Merge carts and validate inventory
      mergeServerCart(serverCart.items);

      if (!validateInventory()) {
        toast({
          title: "Cart Updated",
          description: "Some items were adjusted due to inventory availability",
          variant: "warning",
        });
      }

      // Sync merged items to server
      for (const item of items) {
        if (!hasErrors()) {
          await syncCartMutation.mutateAsync({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          });
        }
      }

      setAnonymous(false);
      updateLastSyncTimestamp();

      toast({
        title: "Cart Synchronized",
        description: "Your cart has been updated with your account",
      });
    } catch (error) {
      console.error("Error syncing anonymous cart:", error);
      toast({
        title: "Sync Error",
        description: "Failed to sync your cart. Please try again later.",
        variant: "destructive",
      });
      throw error;
    }
  }, [
    session,
    isAnonymous,
    items,
    utils.client.cart.getCart,
    mergeServerCart,
    validateInventory,
    hasErrors,
    syncCartMutation,
    setAnonymous,
    updateLastSyncTimestamp,
    toast,
  ]);

  return { syncAnonymousCart };
}

/**
 * Cart Provider Component
 * Manages cart initialization, session changes, and periodic synchronization
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const initialSyncRef = useRef(false);
  const { syncWithServer } = useCartOperations();
  const { syncAnonymousCart } = useCartSync();
  const { setAnonymous } = useCart();
  const isAnonymous = useCart((state) => state.isAnonymous);

  // Single effect for initialization and session changes
  useEffect(() => {
    const handleCartSync = async () => {
      try {
        if (!initialSyncRef.current) {
          initialSyncRef.current = true;
          if (session) {
            await syncWithServer();
          }
        } else if (session && isAnonymous) {
          // Handle login after initial load
          await syncAnonymousCart();
        } else if (!session && !isAnonymous) {
          // Handle logout
          setAnonymous(true);
        }
      } catch (error) {
        console.error("Cart sync error:", error);
      }
    };

    void handleCartSync();
  }, [session, isAnonymous, syncWithServer, syncAnonymousCart, setAnonymous]);

  return children;
}
