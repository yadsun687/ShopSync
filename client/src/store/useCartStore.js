import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const clampQuantity = (quantity) => Math.max(1, Number.parseInt(quantity, 10) || 1);

const getAvailableStock = (product) => Math.max(0, Number(product?.stock) || 0);

const toCartItem = (product, quantity) => ({
  _id: product._id,
  name: product.name,
  category: product.category,
  price: Number(product.price) || 0,
  stock: getAvailableStock(product),
  tags: product.tags ?? [],
  quantity,
});

const useCartStore = create(
  persist(
    (set) => ({
      items: [],
      addItem: (product, quantity = 1) =>
        set((state) => {
          const availableStock = getAvailableStock(product);

          if (!product?._id || availableStock === 0) {
            return state;
          }

          const nextQuantity = clampQuantity(quantity);
          const existingItem = state.items.find((item) => item._id === product._id);

          if (existingItem) {
            const updatedQuantity = Math.min(existingItem.quantity + nextQuantity, availableStock);

            return {
              items: state.items.map((item) =>
                item._id === product._id
                  ? { ...toCartItem(product, updatedQuantity), quantity: updatedQuantity }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, toCartItem(product, Math.min(nextQuantity, availableStock))],
          };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item._id !== productId),
        })),
      setItemQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item._id === productId
              ? {
                  ...item,
                  quantity: Math.min(clampQuantity(quantity), Math.max(item.stock, 1)),
                }
              : item
          ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'shopsync-cart',
    }
  )
);

export default useCartStore;