'use server';

import { getSupabaseServer } from '@/lib/supabase/server';
import type { CartItem } from '@/context/cart-context';

export async function checkCart(items: CartItem[]): Promise<
  { items: CartItem[]; error?: never } | { error: string; items?: never }
> {
  if (!Array.isArray(items) || !items.length || items.length > 30
    || items.some(item => !item || typeof item.productId !== 'string' || !Number.isInteger(item.quantity) || item.quantity < 1)) {
    return { error: 'Your cart is invalid. Please remove the affected items and try again.' };
  }
  try {
    const db = await getSupabaseServer();
    const { data, error } = await db.from('products')
      .select('id, price, product_variants(id, colour, size, size_system, size_value, stock)')
      .eq('is_active', true).in('id', [...new Set(items.map(item => item.productId))]);
    if (error) return { error: 'Could not check availability. Please try again.' };
    const refreshed: CartItem[] = [];
    for (const item of items) {
      const product = data?.find(product => product.id === item.productId);
      const variant = product?.product_variants.find(v => v.id === item.variantId
        && v.colour === item.color && (v.size_system ?? 'EU') === (item.sizeSystem ?? 'EU')
        && String(v.size_value || v.size) === String(item.size));
      if (!product || !variant || variant.stock < item.quantity) {
        return { error: `${item.name}: the selected variant is unavailable or has insufficient stock. Remove it from your bag and select it again.` };
      }
      refreshed.push({ ...item, price: product.price, maxStock: variant.stock });
    }
    return { items: refreshed };
  } catch {
    return { error: 'Could not check availability. Please try again.' };
  }
}
