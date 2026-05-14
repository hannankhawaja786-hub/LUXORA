// ============================================================
// LUXORA — Cart Database Functions
// ============================================================

import { supabase } from '../supabase';
import type { CartItemWithProduct } from '../types/database.types';

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

export async function getCartItems(userId: string): Promise<CartItemWithProduct[]> {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, products(*, categories(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[DB] getCartItems error:', error.message);
    throw new Error(error.message);
  }

  return (data as CartItemWithProduct[]) ?? [];
}

export async function getCartCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('cart_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

// ─────────────────────────────────────────────
// WRITE
// ─────────────────────────────────────────────

export async function addToCart(
  userId: string,
  productId: string,
  quantity = 1,
): Promise<void> {
  // upsert: if product already in cart, increase quantity
  const { error } = await supabase.rpc('upsert_cart_item', {
    p_user_id: userId,
    p_product_id: productId,
    p_quantity: quantity,
  });

  // Fallback if RPC not available: manual upsert
  if (error) {
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      const { error: updateErr } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);

      if (updateErr) throw new Error(updateErr.message);
    } else {
      const { error: insertErr } = await supabase
        .from('cart_items')
        .insert({ user_id: userId, product_id: productId, quantity });

      if (insertErr) throw new Error(insertErr.message);
    }
  }
}

export async function updateCartQuantity(
  cartItemId: string,
  quantity: number,
): Promise<void> {
  if (quantity <= 0) {
    await removeFromCart(cartItemId);
    return;
  }

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId);

  if (error) throw new Error(error.message);
}

export async function removeFromCart(cartItemId: string): Promise<void> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId);

  if (error) throw new Error(error.message);
}

export async function clearCart(userId: string): Promise<void> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
}