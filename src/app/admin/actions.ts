'use server';

import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase/server';
import { isOrderStatus } from '@/lib/order-status';

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function signOut() {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

// ---------------------------------------------------------------------------
// Product CRUD
// ---------------------------------------------------------------------------

type ProductInput = {
  name: string;
  slug: string;
  description: string;
  category_id: string;
  price: number;
  compare_at_price: number | null;
  featured: boolean;
  is_new_arrival: boolean;
  is_on_sale: boolean;
  is_active: boolean;
};

export async function createProduct(
  data: ProductInput,
): Promise<{ id: string } | { error: string }> {
  if (!data.name.trim()) return { error: 'Name is required.' };
  if (!data.slug.trim()) return { error: 'Slug is required.' };
  if (!data.category_id) return { error: 'Category is required.' };
  if (!data.price || data.price <= 0) return { error: 'Price must be greater than zero.' };

  const supabase = await getSupabaseServer();
  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name: data.name.trim(),
      slug: data.slug.trim(),
      description: data.description || null,
      category_id: data.category_id,
      price: Math.round(data.price),
      compare_at_price: data.compare_at_price ? Math.round(data.compare_at_price) : null,
      featured: data.featured,
      is_new_arrival: data.is_new_arrival,
      is_on_sale: data.is_on_sale,
      is_active: data.is_active,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') return { error: 'A product with this slug already exists.' };
    return { error: error.message };
  }

  return { id: product.id };
}

export async function updateProduct(
  id: string,
  data: ProductInput,
): Promise<{ success: true } | { error: string }> {
  if (!data.name.trim()) return { error: 'Name is required.' };
  if (!data.slug.trim()) return { error: 'Slug is required.' };
  if (!data.category_id) return { error: 'Category is required.' };
  if (!data.price || data.price <= 0) return { error: 'Price must be greater than zero.' };

  const supabase = await getSupabaseServer();
  const { error } = await supabase
    .from('products')
    .update({
      name: data.name.trim(),
      slug: data.slug.trim(),
      description: data.description || null,
      category_id: data.category_id,
      price: Math.round(data.price),
      compare_at_price: data.compare_at_price ? Math.round(data.compare_at_price) : null,
      featured: data.featured,
      is_new_arrival: data.is_new_arrival,
      is_on_sale: data.is_on_sale,
      is_active: data.is_active,
    })
    .eq('id', id);

  if (error) {
    if (error.code === '23505') return { error: 'A product with this slug already exists.' };
    return { error: error.message };
  }

  return { success: true };
}

export async function deleteProduct(
  id: string,
): Promise<{ success: true } | { error: string }> {
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function toggleProductActive(
  id: string,
  isActive: boolean,
): Promise<{ success: true } | { error: string }> {
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from('products').update({ is_active: isActive }).eq('id', id);
  if (error) return { error: error.message };
  return { success: true };
}

// ---------------------------------------------------------------------------
// Product Images
// ---------------------------------------------------------------------------

export async function addProductImage(
  productId: string,
  url: string,
  altText: string,
  sortOrder: number,
): Promise<{ id: string } | { error: string }> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from('product_images')
    .insert({ product_id: productId, url, alt_text: altText || null, sort_order: sortOrder })
    .select('id')
    .single();

  if (error) return { error: error.message };
  return { id: data.id };
}

export async function removeProductImage(
  imageId: string,
  imageUrl: string,
): Promise<{ success: true } | { error: string }> {
  const supabase = await getSupabaseServer();

  const storagePath = imageUrl.split('/product-images/')[1];
  if (storagePath) {
    await supabase.storage.from('product-images').remove([storagePath]);
  }

  const { error } = await supabase.from('product_images').delete().eq('id', imageId);
  if (error) return { error: error.message };
  return { success: true };
}

// ---------------------------------------------------------------------------
// Product Variants
// ---------------------------------------------------------------------------

export async function addProductVariant(
  productId: string,
  colour: string,
  size: number,
  stock: number,
): Promise<{ id: string } | { error: string }> {
  if (!colour.trim()) return { error: 'Colour is required.' };
  if (size < 33 || size > 50) return { error: 'Size must be between 33 and 50.' };
  if (stock < 0) return { error: 'Stock cannot be negative.' };

  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from('product_variants')
    .insert({ product_id: productId, colour: colour.trim(), size, stock })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') return { error: 'A variant with this colour and size already exists.' };
    return { error: error.message };
  }
  return { id: data.id };
}

export async function removeProductVariant(
  variantId: string,
): Promise<{ success: true } | { error: string }> {
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from('product_variants').delete().eq('id', variantId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function updateVariantStock(
  variantId: string,
  stock: number,
): Promise<{ success: true } | { error: string }> {
  if (stock < 0) return { error: 'Stock cannot be negative.' };
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from('product_variants').update({ stock }).eq('id', variantId);
  if (error) return { error: error.message };
  return { success: true };
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<{ success: true } | { error: string }> {
  if (!isOrderStatus(status)) return { error: 'Invalid order status.' };
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
  if (error) return { error: error.message };
  return { success: true };
}
