// ============================================================
// LUXORA — Wishlist Zustand Store
// ============================================================
 
import { create } from 'zustand';
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from '../database/wishlist';
import type { WishlistItemWithProduct } from '../types/database.types';
 
interface WishlistState {
  items: WishlistItemWithProduct[];
  wishlistIds: Set<string>;
  isLoading: boolean;
  error: string | null;
 
  fetchWishlist: (userId: string) => Promise<void>;
  addItem: (userId: string, productId: string) => Promise<void>;
  removeItem: (userId: string, productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  clearError: () => void;
}
 
export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  wishlistIds: new Set(),
  isLoading: false,
  error: null,
 
  fetchWishlist: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const items = await getWishlist(userId);
      const wishlistIds = new Set(items.map((i) => i.product_id));
      set({ items, wishlistIds, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load wishlist';
      set({ error: message, isLoading: false });
    }
  },
 
  addItem: async (userId, productId) => {
    const prevIds = get().wishlistIds;
    const newIds = new Set(prevIds);
    newIds.add(productId);
    set({ wishlistIds: newIds });
 
    try {
      await addToWishlist(userId, productId);
      await get().fetchWishlist(userId);
    } catch (err) {
      set({ wishlistIds: prevIds });
      const message = err instanceof Error ? err.message : 'Failed to add to wishlist';
      set({ error: message });
    }
  },
 
 removeItem: async (userId, productId) => {
    const prevItems = get().items;
    const prevIds   = get().wishlistIds;

    const newItems = prevItems.filter((i) => i.product_id !== productId);
    const newIds   = new Set(prevIds);
    newIds.delete(productId);
    set({ items: newItems, wishlistIds: newIds });

    try {
      await removeFromWishlist(userId, productId);
    } catch (err) {
      set({ items: prevItems, wishlistIds: prevIds });
      const message = err instanceof Error ? err.message : 'Failed to remove from wishlist';
      set({ error: message });
    }
  },
 
  isWishlisted: (productId) => get().wishlistIds.has(productId),
 
  // ← YEH MISSING THA — crash ka asli reason
  clearError: () => set({ error: null }),
}));
 