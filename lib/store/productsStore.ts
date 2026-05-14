// ============================================================
// LUXORA — Products Zustand Store
// ============================================================

import { create } from 'zustand';
import {
    getCategories,
    getFeaturedProducts,
    getProductById,
    getProducts,
    getProductsByCategory,
    searchProducts,
} from '../database/products';
import type { Category, Product, ProductFilters } from '../types/database.types';

interface ProductsState {
  // Data
  products: Product[];
  featuredProducts: Product[];
  categories: Category[];
  selectedProduct: Product | null;

  // UI State
  isLoading: boolean;
  isLoadingProduct: boolean;
  error: string | null;
  searchQuery: string;
  activeCategory: string | null; // category slug

  // Actions
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  fetchFeaturedProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  fetchProductsByCategory: (slug: string) => Promise<void>;
  searchForProducts: (query: string) => Promise<void>;
  setActiveCategory: (slug: string | null) => void;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  products: [],
  featuredProducts: [],
  categories: [],
  selectedProduct: null,
  isLoading: false,
  isLoadingProduct: false,
  error: null,
  searchQuery: '',
  activeCategory: null,
};

export const useProductsStore = create<ProductsState>((set, get) => ({
  ...initialState,

  fetchProducts: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const products = await getProducts(filters);
      set({ products, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch products';
      set({ error: message, isLoading: false });
    }
  },

  fetchFeaturedProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const featuredProducts = await getFeaturedProducts();
      set({ featuredProducts, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch featured products';
      set({ error: message, isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await getCategories();
      set({ categories });
    } catch (err) {
      console.error('[ProductsStore] fetchCategories:', err);
    }
  },

  fetchProductById: async (id: string) => {
    set({ isLoadingProduct: true, error: null, selectedProduct: null });
    try {
      const product = await getProductById(id);
      set({ selectedProduct: product, isLoadingProduct: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch product';
      set({ error: message, isLoadingProduct: false });
    }
  },

  fetchProductsByCategory: async (slug: string) => {
    set({ isLoading: true, error: null, activeCategory: slug });
    try {
      const products = await getProductsByCategory(slug);
      set({ products, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch category products';
      set({ error: message, isLoading: false });
    }
  },

  searchForProducts: async (query: string) => {
    set({ isLoading: true, error: null, searchQuery: query });
    try {
      const products = await searchProducts(query);
      set({ products, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed';
      set({ error: message, isLoading: false });
    }
  },

  setActiveCategory: (slug) => set({ activeCategory: slug }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  clearError: () => set({ error: null }),
  reset: () => set(initialState),
}));