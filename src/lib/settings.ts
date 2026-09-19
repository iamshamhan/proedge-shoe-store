import { cache } from "react";
import { createClient } from '@supabase/supabase-js';

export interface StoreSettings {
  freeDeliveryEnabled: boolean;
  freeDeliveryThreshold: number;
  defaultDeliveryFee: number;
  bannerTagline: string;
  heroProductSlug?: string;
  saleEnabled?: boolean;
  saleDiscountPercent?: number;
  brandName?: string;
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  whatsappNumber?: string;
  saleSectionTitle?: string;
  saleSectionSubtitle?: string;
  newArrivalsTitle?: string;
  newArrivalsSubtitle?: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  freeDeliveryEnabled: true,
  freeDeliveryThreshold: 30000,
  defaultDeliveryFee: 500,
  bannerTagline: 'Built for Your Next Step',
  heroProductSlug: 'proedge-runner-x1',
  saleEnabled: true,
  saleDiscountPercent: 30,
  brandName: 'PROEDGE',
  contactAddress: 'Galle Road, Colombo 03, Sri Lanka',
  contactPhone: '+94 11 234 5678',
  contactEmail: 'support@proedge.lk',
  whatsappNumber: '+94 77 123 4567',
  saleSectionTitle: 'Special Offers',
  saleSectionSubtitle: 'Explore our top discounted sneakers and gear.',
  newArrivalsTitle: 'New Arrivals',
  newArrivalsSubtitle: 'Just released designs with improved sole ergonomics and cutting-edge material tech.',
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
  brand_name?: string | null;
  contact_address?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  whatsapp_number?: string | null;
  sale_section_title?: string | null;
  sale_section_subtitle?: string | null;
  new_arrivals_title?: string | null;
  new_arrivals_subtitle?: string | null;
};

/**
 * Server-only or static fetch of store settings.
 * If Supabase is unavailable or table does not exist yet,
 * it returns DEFAULT_STORE_SETTINGS gracefully.
 */
export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
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
            next: { tags: ["store-settings"] },
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
      brandName: row.brand_name?.trim() || DEFAULT_STORE_SETTINGS.brandName,
      contactAddress: row.contact_address?.trim() || DEFAULT_STORE_SETTINGS.contactAddress,
      contactPhone: row.contact_phone?.trim() || DEFAULT_STORE_SETTINGS.contactPhone,
      contactEmail: row.contact_email?.trim() || DEFAULT_STORE_SETTINGS.contactEmail,
      whatsappNumber: row.whatsapp_number?.trim() || DEFAULT_STORE_SETTINGS.whatsappNumber,
      saleSectionTitle: row.sale_section_title?.trim() || DEFAULT_STORE_SETTINGS.saleSectionTitle,
      saleSectionSubtitle: row.sale_section_subtitle?.trim() || DEFAULT_STORE_SETTINGS.saleSectionSubtitle,
      newArrivalsTitle: row.new_arrivals_title?.trim() || DEFAULT_STORE_SETTINGS.newArrivalsTitle,
      newArrivalsSubtitle: row.new_arrivals_subtitle?.trim() || DEFAULT_STORE_SETTINGS.newArrivalsSubtitle,
    };
  } catch (err) {
    console.error('Error fetching store settings:', err);
    return DEFAULT_STORE_SETTINGS;
  }
});
