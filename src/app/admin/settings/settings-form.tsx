'use client';

import React, { useState, useTransition } from 'react';
import {
  Truck,
  CheckCircle2,
  AlertCircle,
  Save,
  Sparkles,
  ExternalLink,
  Tag,
  Building,
  Phone,
  Mail,
  MapPin,
  Megaphone,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { StoreSettings } from '@/lib/settings';
import type { Product } from '@/types/product';
import { formatLKR } from '@/data/products';
import { updateStoreSettings } from '../actions';

interface SettingsFormProps {
  initialSettings: StoreSettings;
  products?: Product[];
}

const PRESET_THRESHOLDS = [15000, 20000, 25000, 30000, 40000, 50000];
const PRESET_DISCOUNTS = [10, 15, 20, 25, 30, 40, 50, 70];

export function SettingsForm({ initialSettings, products = [] }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  // Brand & Announcement
  const [brandName, setBrandName] = useState<string>(
    initialSettings.brandName || 'PROEDGE',
  );
  const [bannerTagline, setBannerTagline] = useState<string>(
    initialSettings.bannerTagline || 'Built for Your Next Step',
  );

  // Sale Campaign
  const [saleEnabled, setSaleEnabled] = useState<boolean>(
    initialSettings.saleEnabled !== false,
  );
  const [saleDiscountPercent, setSaleDiscountPercent] = useState<number>(
    initialSettings.saleDiscountPercent ?? 30,
  );

  // Delivery
  const [freeDeliveryEnabled, setFreeDeliveryEnabled] = useState(
    initialSettings.freeDeliveryEnabled,
  );
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(
    initialSettings.freeDeliveryThreshold,
  );
  const [defaultDeliveryFee, setDefaultDeliveryFee] = useState<number>(
    initialSettings.defaultDeliveryFee,
  );

  // Hero Product Spotlight
  const [heroProductSlug, setHeroProductSlug] = useState<string>(
    initialSettings.heroProductSlug || 'proedge-runner-x1',
  );

  // Contact Info (Get In Touch)
  const [contactAddress, setContactAddress] = useState<string>(
    initialSettings.contactAddress || 'Galle Road, Colombo 03, Sri Lanka',
  );
  const [contactPhone, setContactPhone] = useState<string>(
    initialSettings.contactPhone || '+94 11 234 5678',
  );
  const [contactEmail, setContactEmail] = useState<string>(
    initialSettings.contactEmail || 'support@proedge.lk',
  );

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const res = await updateStoreSettings({
        brand_name: brandName.trim() || 'PROEDGE',
        banner_tagline: bannerTagline.trim(),
        free_delivery_enabled: freeDeliveryEnabled,
        free_delivery_threshold: Number(freeDeliveryThreshold) || 0,
        default_delivery_fee: Number(defaultDeliveryFee) || 0,
        hero_product_slug: heroProductSlug,
        sale_enabled: saleEnabled,
        sale_discount_percent: Number(saleDiscountPercent) || 0,
        contact_address: contactAddress.trim(),
        contact_phone: contactPhone.trim(),
        contact_email: contactEmail.trim(),
      });

      if ('success' in res && res.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('proedge_settings_updated'));
          try {
            localStorage.setItem('proedge_settings_sync', Date.now().toString());
          } catch {}
        }
        setMessage({
          type: 'success',
          text: 'Store settings saved successfully! Storefront headers, banners, footer, and checkout rules have been updated.',
        });
      } else if ('error' in res) {
        setMessage({
          type: 'error',
          text: res.error,
        });
      }
    });
  };

  const selectedHeroProduct = products.find((p) => p.slug === heroProductSlug);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Status Feedback Notification */}
      {message && (
        <div
          className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs font-bold ${
            message.type === 'success'
              ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
              : 'border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          )}
          <div className="flex-1 leading-relaxed">{message.text}</div>
        </div>
      )}

      {/* 1. Brand & Announcement Tagline */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
        <div className="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Megaphone className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              Brand & Announcement Bar
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Customize the store logo name and the headline banner shown at the top of every page
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="brandName"
              className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1"
            >
              Store / Logo Brand Name
            </label>
            <input
              id="brandName"
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="PROEDGE"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="mt-1 text-[11px] text-zinc-400">
              Appears in header logo, footer branding, and page titles.
            </p>
          </div>

          <div>
            <label
              htmlFor="bannerTagline"
              className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1"
            >
              Announcement Tagline
            </label>
            <input
              id="bannerTagline"
              type="text"
              value={bannerTagline}
              onChange={(e) => setBannerTagline(e.target.value)}
              placeholder="Built for Your Next Step"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="mt-1 text-[11px] text-zinc-400">
              Shown in the top announcement bar and directly under the footer logo.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Storewide Promotional Sale Campaign */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Promotional Sale Campaign
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Turn the promotional sale on or off and set the discount percentage
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-2.5">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                saleEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'
              }`}
            >
              {saleEnabled ? 'Campaign Active' : 'Campaign Paused'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={saleEnabled}
              onClick={() => setSaleEnabled(!saleEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                saleEnabled ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            >
              <span className="sr-only">Toggle sale</span>
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  saleEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="w-full sm:w-48">
              <label
                htmlFor="saleDiscount"
                className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1"
              >
                Discount Percentage (%)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-zinc-400">%</span>
                <input
                  id="saleDiscount"
                  type="number"
                  min="0"
                  max="100"
                  disabled={!saleEnabled}
                  value={saleDiscountPercent}
                  onChange={(e) =>
                    setSaleDiscountPercent(Math.max(0, Math.min(100, Number(e.target.value))))
                  }
                  className={`w-full rounded-lg border pl-8 pr-3 py-2 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    saleEnabled
                      ? 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/40 text-zinc-400 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>

            {saleEnabled && (
              <div className="flex-1">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Quick Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_DISCOUNTS.map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setSaleDiscountPercent(pct)}
                      className={`rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${
                        saleDiscountPercent === pct
                          ? 'bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950'
                          : 'border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <p className="text-[11px] text-zinc-400">
            When enabled, the header displays a `{saleDiscountPercent}% OFF` badge, the homepage shows the promo banner, and the /sale page offers dynamic discounts.
          </p>
        </div>
      </div>

      {/* 3. Delivery & Shipping Settings */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Delivery & Shipping Rules
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Configure free shipping spend thresholds and standard delivery fees
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-2.5">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                freeDeliveryEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'
              }`}
            >
              {freeDeliveryEnabled ? 'Free Delivery Active' : 'Free Delivery Off'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={freeDeliveryEnabled}
              onClick={() => setFreeDeliveryEnabled(!freeDeliveryEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                freeDeliveryEnabled ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            >
              <span className="sr-only">Toggle free delivery</span>
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  freeDeliveryEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="threshold"
              className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1"
            >
              Free Delivery Spend Threshold (Rs.)
            </label>
            <input
              id="threshold"
              type="number"
              min="0"
              step="500"
              disabled={!freeDeliveryEnabled}
              value={freeDeliveryThreshold}
              onChange={(e) => setFreeDeliveryThreshold(Number(e.target.value))}
              className={`w-full rounded-lg border px-3 py-2 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                freeDeliveryEnabled
                  ? 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/40 text-zinc-400 cursor-not-allowed'
              }`}
            />
            {freeDeliveryEnabled && (
              <div className="mt-2 flex flex-wrap gap-1">
                {PRESET_THRESHOLDS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFreeDeliveryThreshold(val)}
                    className={`rounded px-2 py-0.5 text-[11px] font-bold transition-colors ${
                      freeDeliveryThreshold === val
                        ? 'bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950'
                        : 'border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    Rs. {val.toLocaleString()}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="defaultFee"
              className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1"
            >
              Standard Islandwide Delivery Fee (Rs.)
            </label>
            <input
              id="defaultFee"
              type="number"
              min="0"
              step="50"
              value={defaultDeliveryFee}
              onChange={(e) => setDefaultDeliveryFee(Number(e.target.value))}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="mt-1 text-[11px] text-zinc-400">
              Applied automatically during checkout for orders below the threshold.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Homepage Hero Spotlight Product */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
        <div className="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              Homepage Hero Spotlight Shoe
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Select the product showcased in the top hero showcase on the homepage
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8">
            <label
              htmlFor="heroProduct"
              className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1"
            >
              Featured Product
            </label>
            <select
              id="heroProduct"
              value={heroProductSlug}
              onChange={(e) => setHeroProductSlug(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="proedge-runner-x1">Default (PROEDGE Runner X1)</option>
              {products.map((prod) => (
                <option key={prod.id} value={prod.slug}>
                  {prod.name} — Rs. {prod.price.toLocaleString()} ({prod.sport || prod.category})
                </option>
              ))}
            </select>
            {selectedHeroProduct && (
              <div className="mt-2 text-[11px] text-zinc-400 flex items-center gap-3">
                <span>Price: <strong className="text-amber-500">{formatLKR(selectedHeroProduct.price)}</strong></span>
                <span>•</span>
                <Link
                  href={`/product/${selectedHeroProduct.slug}`}
                  target="_blank"
                  className="text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>View Product</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          <div className="md:col-span-4 flex items-center justify-center">
            {selectedHeroProduct?.images?.[0] ? (
              <div className="flex items-center gap-3 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60">
                <div className="relative w-12 h-12 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                  <Image
                    src={selectedHeroProduct.images[0]}
                    alt={selectedHeroProduct.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 text-xs">
                  <p className="font-bold text-zinc-900 dark:text-white truncate">
                    {selectedHeroProduct.name}
                  </p>
                  <p className="text-[11px] text-amber-500 font-bold">
                    {formatLKR(selectedHeroProduct.price)}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* 5. Store Contact & Footer Information */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
        <div className="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Building className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              Store Contact & Footer Information
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Updates the &quot;Get In Touch&quot; section in the customer storefront footer
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="contactAddress"
              className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1 flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>Store Address</span>
            </label>
            <input
              id="contactAddress"
              type="text"
              value={contactAddress}
              onChange={(e) => setContactAddress(e.target.value)}
              placeholder="Galle Road, Colombo 03, Sri Lanka"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label
              htmlFor="contactPhone"
              className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1 flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-amber-500" />
              <span>Contact Phone</span>
            </label>
            <input
              id="contactPhone"
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+94 11 234 5678"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label
              htmlFor="contactEmail"
              className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1 flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-amber-500" />
              <span>Support Email</span>
            </label>
            <input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="support@proedge.lk"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-zinc-950 transition-all hover:bg-amber-400 shadow-sm disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{isPending ? 'Saving Settings…' : 'Save Settings'}</span>
        </button>
      </div>
    </form>
  );
}
