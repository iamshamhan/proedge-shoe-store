'use client';

import React, { useState, useTransition } from 'react';
import {
  Truck,
  CheckCircle2,
  AlertCircle,
  Save,
  Eye,
  Sparkles,
  ExternalLink,
  Tag,
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
  const [freeDeliveryEnabled, setFreeDeliveryEnabled] = useState(
    initialSettings.freeDeliveryEnabled,
  );
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(
    initialSettings.freeDeliveryThreshold,
  );
  const [defaultDeliveryFee, setDefaultDeliveryFee] = useState<number>(
    initialSettings.defaultDeliveryFee,
  );
  const [bannerTagline, setBannerTagline] = useState<string>(
    initialSettings.bannerTagline || 'Built for Your Next Step',
  );
  const [heroProductSlug, setHeroProductSlug] = useState<string>(
    initialSettings.heroProductSlug || 'proedge-runner-x1',
  );
  const [saleEnabled, setSaleEnabled] = useState<boolean>(
    initialSettings.saleEnabled !== false,
  );
  const [saleDiscountPercent, setSaleDiscountPercent] = useState<number>(
    initialSettings.saleDiscountPercent ?? 30,
  );

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const res = await updateStoreSettings({
        free_delivery_enabled: freeDeliveryEnabled,
        free_delivery_threshold: Number(freeDeliveryThreshold) || 0,
        default_delivery_fee: Number(defaultDeliveryFee) || 0,
        banner_tagline: bannerTagline.trim(),
        hero_product_slug: heroProductSlug,
        sale_enabled: saleEnabled,
        sale_discount_percent: Number(saleDiscountPercent) || 0,
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
          text: 'Store settings saved successfully! The storefront announcement, cart, and checkout calculations have been updated.',
        });
      } else if ('error' in res) {
        setMessage({
          type: 'error',
          text: res.error,
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Status Feedback Notification */}
      {message && (
        <div
          className={`flex items-start gap-3 rounded-2xl border p-4 text-sm font-bold ${
            message.type === 'success'
              ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
              : 'border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          )}
          <div className="flex-1 leading-relaxed">{message.text}</div>
        </div>
      )}

      {/* Free Delivery Control Card */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                Free Delivery Feature
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Control whether free delivery threshold applies to your online store
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                freeDeliveryEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'
              }`}
            >
              {freeDeliveryEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={freeDeliveryEnabled}
              onClick={() => setFreeDeliveryEnabled(!freeDeliveryEnabled)}
              className={`relative inline-flex h-8 w-15 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                freeDeliveryEnabled ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            >
              <span className="sr-only">Toggle free delivery</span>
              <span
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  freeDeliveryEnabled ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Threshold Price Field */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="threshold"
                className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200"
              >
                Minimum Spend for Free Delivery (Rs.)
              </label>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                Current: Rs. {Number(freeDeliveryThreshold || 0).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
              Customers whose order subtotal reaches this amount will automatically get free islandwide shipping.
            </p>
            <div className="relative max-w-md">
              <span className="absolute left-4 top-3.5 text-sm font-bold text-zinc-400 dark:text-zinc-500">
                Rs.
              </span>
              <input
                id="threshold"
                type="number"
                min="0"
                step="500"
                disabled={!freeDeliveryEnabled}
                value={freeDeliveryThreshold}
                onChange={(e) => setFreeDeliveryThreshold(Number(e.target.value))}
                className={`w-full rounded-xl border pl-12 pr-4 py-3 text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-amber-500 ${
                  freeDeliveryEnabled
                    ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                }`}
              />
            </div>

            {/* Quick Presets */}
            {freeDeliveryEnabled && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mr-1">
                  Quick Presets:
                </span>
                {PRESET_THRESHOLDS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFreeDeliveryThreshold(val)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                      freeDeliveryThreshold === val
                        ? 'bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950'
                        : 'border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                    }`}
                  >
                    Rs. {val.toLocaleString()}
                  </button>
                ))}
              </div>
            )}
          </div>

          <hr className="border-zinc-100 dark:border-zinc-800" />

          {/* Default Delivery Fee Field */}
          <div>
            <label
              htmlFor="defaultFee"
              className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200 block mb-1.5"
            >
              Standard Islandwide Delivery Fee (Rs.)
            </label>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
              Delivery charge applied to orders that do not qualify for free shipping.
            </p>
            <div className="relative max-w-md">
              <span className="absolute left-4 top-3.5 text-sm font-bold text-zinc-400 dark:text-zinc-500">
                Rs.
              </span>
              <input
                id="defaultFee"
                type="number"
                min="0"
                step="50"
                value={defaultDeliveryFee}
                onChange={(e) => setDefaultDeliveryFee(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-12 pr-4 py-3 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-amber-500"
              />
            </div>
          </div>

          <hr className="border-zinc-100 dark:border-zinc-800" />

          {/* Top Banner Tagline */}
          <div>
            <label
              htmlFor="tagline"
              className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200 block mb-1.5"
            >
              Announcement Tagline
            </label>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
              Shown alongside the delivery notice in the top announcement bar.
            </p>
            <div className="max-w-md">
              <input
                id="tagline"
                type="text"
                value={bannerTagline}
                onChange={(e) => setBannerTagline(e.target.value)}
                placeholder="Built for Your Next Step"
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-amber-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Homepage Hero Spotlight Product */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                Homepage Hero Spotlight Product
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Choose the shoe or sports item featured on the main homepage hero banner.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div>
              <label
                htmlFor="heroProduct"
                className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200 block mb-1.5"
              >
                Select Featured Product
              </label>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
                This item appears prominently in the top hero section next to the headline. Shoppers can click it directly to view details and make a purchase.
              </p>
              <select
                id="heroProduct"
                value={heroProductSlug}
                onChange={(e) => setHeroProductSlug(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-amber-500"
              >
                <option value="proedge-runner-x1">
                  Default (PROEDGE Runner X1)
                </option>
                {products.map((prod) => (
                  <option key={prod.id} value={prod.slug}>
                    {prod.name} — Rs. {prod.price.toLocaleString()} ({prod.sport || prod.category})
                  </option>
                ))}
              </select>
            </div>

            {(() => {
              const selectedProduct = products.find((p) => p.slug === heroProductSlug);
              if (!selectedProduct) return null;
              return (
                <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-500 dark:text-zinc-400">Sport / Category:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-200 uppercase">
                      {selectedProduct.sport || selectedProduct.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-500 dark:text-zinc-400">Current Price:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {formatLKR(selectedProduct.price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-500 dark:text-zinc-400">Slug:</span>
                    <code className="font-mono text-zinc-700 dark:text-zinc-300">{selectedProduct.slug}</code>
                  </div>
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex justify-end">
                    <Link
                      href={`/product/${selectedProduct.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      <span>View Product Page</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Hero Spotlight Preview */}
          <div className="lg:col-span-5">
            <div className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-500" />
              <span>Hero Card Live Preview</span>
            </div>
            {(() => {
              const selectedProduct = products.find((p) => p.slug === heroProductSlug);
              const previewImage =
                selectedProduct?.images?.[0] ||
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop';
              const previewName =
                selectedProduct?.name ||
                (heroProductSlug === 'proedge-runner-x1' ? 'PROEDGE Runner X1' : heroProductSlug);
              const previewPrice = selectedProduct?.price ? formatLKR(selectedProduct.price) : 'Rs. 24,500';
              const previewBadge = selectedProduct?.sport
                ? `${selectedProduct.sport} Spotlight`
                : selectedProduct?.category
                  ? `${selectedProduct.category.toUpperCase()}`
                  : 'Featured Model';

              return (
                <div className="relative w-full aspect-4/5 max-w-xs mx-auto rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-950 p-2.5 border border-zinc-800 shadow-xl overflow-hidden">
                  <div className="relative w-full h-full rounded-xl overflow-hidden">
                    <Image
                      src={previewImage}
                      alt={previewName}
                      fill
                      sizes="320px"
                      className="object-cover object-center"
                    />
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-zinc-950/90 backdrop-blur-md p-3 rounded-lg border border-zinc-800 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest block truncate">
                          {previewBadge}
                        </span>
                        <h4 className="font-bold text-xs text-white uppercase truncate">
                          {previewName}
                        </h4>
                      </div>
                      <span className="shrink-0 text-xs font-black px-2 py-0.5 bg-amber-500 text-zinc-950 rounded">
                        {previewPrice}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Storewide Sale Campaign Settings */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Tag className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                Storewide Sale Campaign
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Turn the promotional sale campaign on or off and set the storewide discount percentage
              </p>
            </div>
          </div>

          {/* Sale Toggle Switch */}
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                saleEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'
              }`}
            >
              {saleEnabled ? 'Campaign Active' : 'Campaign Paused'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={saleEnabled}
              onClick={() => setSaleEnabled(!saleEnabled)}
              className={`relative inline-flex h-8 w-15 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                saleEnabled ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            >
              <span className="sr-only">Toggle sale campaign</span>
              <span
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  saleEnabled ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Sale Discount % Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="saleDiscount"
                className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200"
              >
                Promotional Discount Percentage (%)
              </label>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                Current: {saleDiscountPercent}% OFF
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
              This percentage is displayed on the navigation bar badge, homepage promo banner, and the dedicated /sale page.
            </p>

            <div className="relative max-w-md">
              <span className="absolute left-4 top-3.5 text-sm font-bold text-zinc-400 dark:text-zinc-500">
                %
              </span>
              <input
                id="saleDiscount"
                type="number"
                min="0"
                max="100"
                step="1"
                disabled={!saleEnabled}
                value={saleDiscountPercent}
                onChange={(e) => setSaleDiscountPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                className={`w-full rounded-xl border pl-12 pr-4 py-3 text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-amber-500 ${
                  saleEnabled
                    ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                }`}
              />
            </div>

            {/* Quick Presets */}
            {saleEnabled && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mr-1">
                  Quick Presets:
                </span>
                {PRESET_DISCOUNTS.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setSaleDiscountPercent(pct)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                      saleDiscountPercent === pct
                        ? 'bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950'
                        : 'border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {pct}% OFF
                  </button>
                ))}
              </div>
            )}
          </div>

          <hr className="border-zinc-100 dark:border-zinc-800" />

          {/* Live Sale Feature Preview */}
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-500" />
              <span>Sale Promotional Preview</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Header Badge Preview */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-2">
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Header Navigation Preview
                </span>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                    Sale
                  </span>
                  {saleEnabled ? (
                    <span className="px-1.5 py-0.5 text-[10px] font-black bg-amber-500 text-zinc-950 rounded-full">
                      {saleDiscountPercent}% OFF
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-zinc-400 italic">
                      (badge hidden)
                    </span>
                  )}
                </div>
              </div>

              {/* Homepage Banner Preview */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-2">
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Homepage Banner Teaser
                </span>
                {saleEnabled ? (
                  <div className="p-3 rounded-lg bg-zinc-950 text-white border border-zinc-800 text-xs">
                    <p className="font-bold text-zinc-300">
                      STEP INTO THE SALE — Up to{' '}
                      <span className="text-amber-400 font-black">{saleDiscountPercent}% off</span>
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 text-xs font-medium italic">
                    Homepage sale banner is hidden when campaign is paused.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Storefront Preview Card */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-4 w-4 text-amber-500" />
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
            Live Storefront Top Banner Preview
          </h3>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-800 shadow-inner">
          <div className="bg-zinc-900 text-zinc-100 text-xs py-2.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
            {freeDeliveryEnabled ? (
              <>
                <span className="font-bold text-white">
                  Islandwide Free Delivery on Orders Over Rs. {Number(freeDeliveryThreshold || 0).toLocaleString()}
                </span>
                <span className="text-amber-500">•</span>
                <span className="text-zinc-400">{bannerTagline || 'Built for Your Next Step'}</span>
              </>
            ) : (
              <>
                <span className="font-bold text-white">Islandwide Courier Delivery Across Sri Lanka</span>
                <span className="text-amber-500">•</span>
                <span className="text-zinc-400">{bannerTagline || 'Built for Your Next Step'}</span>
              </>
            )}
          </div>
        </div>
        <p className="mt-2 text-[11px] text-zinc-400 dark:text-zinc-500">
          This preview updates instantly as you change settings above.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-8 py-3.5 text-sm font-black uppercase tracking-wider text-zinc-950 transition-all hover:bg-amber-400 shadow-md disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{isPending ? 'Saving Settings...' : 'Save Settings'}</span>
        </button>
      </div>
    </form>
  );
}
