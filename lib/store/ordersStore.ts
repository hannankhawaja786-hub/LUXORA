// ============================================================
// LUXORA — Orders Zustand Store
// ============================================================

import { create } from 'zustand';
import {
  getUserOrders,
  placeOrder as placeOrderDB,
  type PlaceOrderParams,
} from '../database/orders';
import type { Order } from '../types/database.types';

interface OrdersState {
  orders:      Order[];
  isLoading:   boolean;
  error:       string | null;
  fetchOrders: (userId: string) => Promise<void>;
  placeOrder:  (params: PlaceOrderParams) => Promise<Order>;
  clearError:  () => void;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  orders:    [],
  isLoading: false,
  error:     null,

  // ─── Fetch all orders for a user ─────────────────────────
  fetchOrders: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const orders = await getUserOrders(userId);
      set({ orders, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load orders';
      set({ error: message, isLoading: false });
    }
  },

  // ─── Place a new order ────────────────────────────────────
  placeOrder: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const order = await placeOrderDB(params);
      // Prepend to local orders list so it shows up immediately
      set((state) => ({
        orders:    [order, ...state.orders],
        isLoading: false,
      }));
      return order;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to place order';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));