import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  dishId: string;
  dishName: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string | null;
};

type CartStore = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (dishId: string) => void;
  setQuantity: (dishId: string, quantity: number) => void;
  clear: () => void;
};

const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.dishId === item.dishId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.dishId === item.dishId ? { ...i, quantity: i.quantity + quantity } : i
              )
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        }),
      removeItem: (dishId) =>
        set((state) => ({ items: state.items.filter((i) => i.dishId !== dishId) })),
      setQuantity: (dishId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.dishId !== dishId)
              : state.items.map((i) => (i.dishId === dishId ? { ...i, quantity } : i))
        })),
      clear: () => set({ items: [] })
    }),
    { name: "crunch-time-cart" }
  )
);

export function useCart() {
  const store = useCartStore();
  const total = store.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const count = store.items.reduce((sum, i) => sum + i.quantity, 0);
  return { ...store, total, count };
}
