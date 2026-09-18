import { createClient } from '@supabase/supabase-js';

export interface StoreSettings {
  freeDeliveryEnabled: boolean;
  freeDeliveryThreshold: number;
  defaultDeliveryFee: number;
  bannerTagline: string;
  heroProductSlug?: string;
  saleEnabled?: boolean;
  saleDiscountPercent?: number;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  freeDeliveryEnabled: true,
  freeDeliveryThreshold: 30000,
  defaultDeliveryFee: 500,
  bannerTagline: 'Built for Your Next Step',
  heroProductSlug: 'proedge-runner-x1',
  saleEnabled: true,
  saleDiscountPercent: 30,
};

type DbSettingsRow = {
  id: string;
  free_delivery_enabled: boolean;
  free_delivery_threshold: number;
  default_delivery_fee: number;
  banner_tagline: string | null;
  hero_product_slug?: string | null;
  sale_enabled?: boolean | null;
  sale_discount_percent?: number | null;
};

/**
 * Server-only or static fetch of store settings.
 * If Supabase is unavailable or table does not exist yet,
 * it returns DEFAULT_STORE_SETTINGS gracefully.
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return DEFAULT_STORE_SETTINGS;
  }

  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false },
      global: {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            cache: 'no-store',
          }),
      },
    });
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_STORE_SETTINGS;
    }

    const row = data as unknown as DbSettingsRow;
    return {
      freeDeliveryEnabled: row.free_delivery_enabled ?? DEFAULT_STORE_SETTINGS.freeDeliveryEnabled,
      freeDeliveryThreshold:
        typeof row.free_delivery_threshold === 'number'
          ? row.free_delivery_threshold
          : DEFAULT_STORE_SETTINGS.freeDeliveryThreshold,
      defaultDeliveryFee:
        typeof row.default_delivery_fee === 'number'
          ? row.default_delivery_fee
          : DEFAULT_STORE_SETTINGS.defaultDeliveryFee,
      bannerTagline: row.banner_tagline?.trim() || DEFAULT_STORE_SETTINGS.bannerTagline,
      heroProductSlug: row.hero_product_slug?.trim() || DEFAULT_STORE_SETTINGS.heroProductSlug,
      saleEnabled: row.sale_enabled ?? DEFAULT_STORE_SETTINGS.saleEnabled,
      saleDiscountPercent:
        typeof row.sale_discount_percent === 'number'
          ? row.sale_discount_percent
          : DEFAULT_STORE_SETTINGS.saleDiscountPercent,
    };
  } catch (err) {
    console.error('Error fetching store settings:', err);
    return DEFAULT_STORE_SETTINGS;
  }
}
