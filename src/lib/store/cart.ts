import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types";

interface CartStore {
	items: CartItem[];
	addItem: (item: CartItem) => void;
	removeItem: (id: string) => void;
	updateQuantity: (id: string, quantity: number) => void;
	clearCart: () => void;
}

export const useCart = create<CartStore>()(
	persist(
		(set) => ({
			items: [],
			addItem: (item) =>
				set((state) => {
					const existingItem = state.items.find((i) => i.id === item.id);
					if (existingItem) {
						return {
							items: state.items.map((i) =>
								i.id === item.id
									? { ...i, quantity: i.quantity + item.quantity }
									: i,
							),
						};
					}
					return { items: [...state.items, item] };
				}),
			removeItem: (id) =>
				set((state) => ({
					items: state.items.filter((i) => i.id !== id),
				})),
			updateQuantity: (id, quantity) =>
				set((state) => ({
					items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
				})),
			clearCart: () => set({ items: [] }),
		}),
		{
			name: "cart-storage",
		},
	),
);
