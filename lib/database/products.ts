// ============================================================
// LUXORA — Products Database Functions
// ============================================================

import { supabase } from '../supabase';
import type { Category, Product, ProductFilters } from '../types/database.types';

// ─────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[DB] getCategories error:', error.message);
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    throw new Error(error.message);
  }

  return data;
}

// ─────────────────────────────────────────────
// PRODUCTS — READ
// ─────────────────────────────────────────────

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const {
    category_slug,
    is_featured,
    min_price,
    max_price,
    brand,
    tags,
    search,
    limit = 20,
    offset = 0,
  } = filters;

  let query = supabase
    .from('products')
    .select('*, categories(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (is_featured !== undefined) {
    query = query.eq('is_featured', is_featured);
  }

  if (min_price !== undefined) {
    query = query.gte('price', min_price);
  }

  if (max_price !== undefined) {
    query = query.lte('price', max_price);
  }

  if (brand) {
    query = query.ilike('brand', `%${brand}%`);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (tags && tags.length > 0) {
    query = query.overlaps('tags', tags);
  }

  if (category_slug) {
    // First get category id
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category_slug)
      .single();

    if (cat) {
      query = query.eq('category_id', cat.id);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('[DB] getProducts error:', error.message);
    throw new Error(error.message);
  }

  return (data as Product[]) ?? [];
}

export async function getFeaturedProducts(limit = 10): Promise<Product[]> {
  return getProducts({ is_featured: true, limit });
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }

  return data as Product;
}

export async function getProductsByCategory(
  categorySlug: string,
  limit = 20,
  offset = 0,
): Promise<Product[]> {
  return getProducts({ category_slug: categorySlug, limit, offset });
}

export async function searchProducts(query: string, limit = 20): Promise<Product[]> {
  return getProducts({ search: query, limit });
}

// ─────────────────────────────────────────────
// PRODUCTS — ADMIN (write operations)
// Note: Ye functions sirf admin users ke liye hain
// Production mein service_role key use karo
// ─────────────────────────────────────────────

export type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'categories'>;
export type ProductUpdate = Partial<ProductInsert>;

export async function createProduct(product: ProductInsert): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select('*, categories(*)')
    .single();

  if (error) {
    console.error('[DB] createProduct error:', error.message);
    throw new Error(error.message);
  }

  return data as Product;
}

export async function updateProduct(id: string, updates: ProductUpdate): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select('*, categories(*)')
    .single();

  if (error) {
    console.error('[DB] updateProduct error:', error.message);
    throw new Error(error.message);
  }

  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ is_active: false }) // soft delete
    .eq('id', id);

  if (error) {
    console.error('[DB] deleteProduct error:', error.message);
    throw new Error(error.message);
  }
}