// ============================================================
// LUXORA — Cart Zustand Store
// ============================================================

import { create } from 'zustand';
import {
  addToCart,
  clearCart,
  getCartItems,
  removeFromCart,
  updateCartQuantity,
} from '../database/cart';
import { placeOrder } from '../database/orders';
import type { CartItemWithProduct, ShippingAddress } from '../types/database.types';

interface CartState {
  // Data
  items: CartItemWithProduct[];

  // UI
  isLoading: boolean;
  isPlacingOrder: boolean;
  error: string | null;

  // Computed
  totalItems: number;
  totalPrice: number;
  totalPriceFormatted: string;

  // Actions
  fetchCart: (userId: string) => Promise<void>;
  addItem: (userId: string, productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearAll: (userId: string) => Promise<void>;
  checkout: (params: {
    userId: string;
    shippingAddress: ShippingAddress;
    paymentMethod: string;
  }) => Promise<string>; // returns order id
  clearError: () => void;
}

function computeTotals(items: CartItemWithProduct[]) {
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.products.price * i.quantity, 0);
  const totalPriceFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalPrice);

  return { totalItems, totalPrice, totalPriceFormatted };
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  isPlacingOrder: false,
  error: null,
  totalItems: 0,
  totalPrice: 0,
  totalPriceFormatted: '$0.00',

  fetchCart: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const items = await getCartItems(userId);
      set({ items, isLoading: false, ...computeTotals(items) });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load cart';
      set({ error: message, isLoading: false });
    }
  },

  addItem: async (userId, productId, quantity = 1) => {
    set({ error: null });
    try {
      await addToCart(userId, productId, quantity);
      // Re-fetch cart to get updated state with product details
      await get().fetchCart(userId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add to cart';
      set({ error: message });
      throw err; // re-throw so UI can react
    }
  },

  updateQuantity: async (cartItemId, quantity) => {
    // Optimistic update
    const prevItems = get().items;
    const updatedItems = prevItems
      .map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
      .filter((item) => item.quantity > 0);

    set({ items: updatedItems, ...computeTotals(updatedItems) });

    try {
      await updateCartQuantity(cartItemId, quantity);
    } catch (err) {
      // Rollback on error
      set({ items: prevItems, ...computeTotals(prevItems) });
      const message = err instanceof Error ? err.message : 'Failed to update quantity';
      set({ error: message });
    }
  },

  removeItem: async (cartItemId) => {
    // Optimistic update
    const prevItems = get().items;
    const updatedItems = prevItems.filter((item) => item.id !== cartItemId);
    set({ items: updatedItems, ...computeTotals(updatedItems) });

    try {
      await removeFromCart(cartItemId);
    } catch (err) {
      // Rollback
      set({ items: prevItems, ...computeTotals(prevItems) });
      const message = err instanceof Error ? err.message : 'Failed to remove item';
      set({ error: message });
    }
  },

  clearAll: async (userId) => {
    const prevItems = get().items;
    set({ items: [], totalItems: 0, totalPrice: 0, totalPriceFormatted: '$0.00' });

    try {
      await clearCart(userId);
    } catch (err) {
      set({ items: prevItems, ...computeTotals(prevItems) });
      const message = err instanceof Error ? err.message : 'Failed to clear cart';
      set({ error: message });
    }
  },

  checkout: async ({ userId, shippingAddress, paymentMethod }) => {
    const { items } = get();
    if (items.length === 0) throw new Error('Cart is empty');

    set({ isPlacingOrder: true, error: null });

    try {
      const order = await placeOrder({
        userId,
        cartItems: items,
        shippingAddress,
        paymentMethod,
      });

      // Clear cart state after order placed
      set({
        items: [],
        totalItems: 0,
        totalPrice: 0,
        totalPriceFormatted: '$0.00',
        isPlacingOrder: false,
      });

      return order.id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Checkout failed';
      set({ error: message, isPlacingOrder: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));