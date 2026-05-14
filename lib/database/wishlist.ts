// ============================================================
// LUXORA — Wishlist Database Functions
// ============================================================
 
import { supabase } from '../supabase';
import type { WishlistItemWithProduct } from '../types/database.types';
 
export async function getWishlist(userId: string): Promise<WishlistItemWithProduct[]> {
  const { data, error } = await supabase
    .from('wishlist')
    .select('*, products(*, categories(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
 
  if (error) throw new Error(error.message);
  return (data as WishlistItemWithProduct[]) ?? [];
}
 
export async function addToWishlist(userId: string, productId: string): Promise<void> {
  const { error } = await supabase
    .from('wishlist')
    .insert({ user_id: userId, product_id: productId });
 
  if (error && error.code !== '23505') {
    throw new Error(error.message);
  }
}
 
export async function removeFromWishlist(userId: string, productId: string): Promise<void> {
  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
 
  if (error) throw new Error(error.message);
}
 
export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('wishlist')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();
 
  if (error) return false;
  return !!data;
}
 