// ============================================================
// LUXORA — useProducts Hook
// ============================================================

import { useEffect } from 'react';
import { useProductsStore } from '../lib/store/productsStore';
import type { ProductFilters } from '../lib/types/database.types';

export function useProducts(filters?: ProductFilters) {
  const {
    products,
    isLoading,
    error,
    fetchProducts,
    clearError,
  } = useProductsStore();

  useEffect(() => {
    fetchProducts(filters);
  }, []);

  return { products, isLoading, error, refetch: () => fetchProducts(filters), clearError };
}

export function useFeaturedProducts() {
  const {
    featuredProducts,
    isLoading,
    error,
    fetchFeaturedProducts,
  } = useProductsStore();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  return { products: featuredProducts, isLoading, error, refetch: fetchFeaturedProducts };
}

export function useCategories() {
  const {
    categories,
    fetchCategories,
  } = useProductsStore();

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, refetch: fetchCategories };
}

export function useProductDetail(id: string) {
  const {
    selectedProduct,
    isLoadingProduct,
    error,
    fetchProductById,
    clearError,
  } = useProductsStore();

  useEffect(() => {
    if (id) fetchProductById(id);
  }, [id]);

  return {
    product: selectedProduct,
    isLoading: isLoadingProduct,
    error,
    refetch: () => fetchProductById(id),
    clearError,
  };
}