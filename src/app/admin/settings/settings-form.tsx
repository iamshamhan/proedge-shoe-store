'use client';
import Image from 'next/image';

import React, { useState, useTransition } from 'react';
import { Save } from 'lucide-react';
import type { StoreSettings } from '@/lib/settings';
import type { Product } from '@/types/product';
import { formatLKR } from '@/data/products';
import { updateStoreSettings } from '../actions';
import { updateAdminProfile } from '../actions';

interface SettingsFormProps {
  initialSettings: StoreSettings;
  products?: Product[];
}

export function SettingsForm({ initialSettings, products = [] }: SettingsFormProps) {
  const [activeTab, setActiveTab] = useState<'store' | 'homepage' | 'profile'>('store');
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Store Settings
  const [brandName, setBrandName] = useState(initialSettings.brandName || 'PROEDGE');
  const [bannerTagline, setBannerTagline] = useState(initialSettings.bannerTagline || 'Built for Your Next Step');
  const [contactAddress, setContactAddress] = useState(initialSettings.contactAddress || 'Galle Road, Colombo 03, Sri Lanka');
  const [contactPhone, setContactPhone] = useState(initialSettings.contactPhone || '+94 11 234 5678');
  const [contactEmail, setContactEmail] = useState(initialSettings.contactEmail || 'support@proedge.lk');
  const [whatsappNumber, setWhatsappNumber] = useState(initialSettings.whatsappNumber || '+94 77 123 4567');

  // Delivery
  const [freeDeliveryEnabled, setFreeDeliveryEnabled] = useState(initialSettings.freeDeliveryEnabled);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(initialSettings.freeDeliveryThreshold);
  const [defaultDeliveryFee, setDefaultDeliveryFee] = useState(initialSettings.defaultDeliveryFee);

  // Homepage Settings
  const [heroProductSlug, setHeroProductSlug] = useState(initialSettings.heroProductSlug || 'proedge-runner-x1');
  const [saleEnabled, setSaleEnabled] = useState(initialSettings.saleEnabled !== false);
  const [saleDiscountPercent, setSaleDiscountPercent] = useState(initialSettings.saleDiscountPercent ?? 30);
  
  const [saleSectionTitle, setSaleSectionTitle] = useState(initialSettings.saleSectionTitle || 'Special Offers');
  const [saleSectionSubtitle, setSaleSectionSubtitle] = useState(initialSettings.saleSectionSubtitle || 'Explore our top discounted sneakers and gear.');
  
  const [newArrivalsTitle, setNewArrivalsTitle] = useState(initialSettings.newArrivalsTitle || 'New Arrivals');
  const [newArrivalsSubtitle, setNewArrivalsSubtitle] = useState(initialSettings.newArrivalsSubtitle || 'Just released designs with improved sole ergonomics and cutting-edge material tech.');

  // Profile Settings
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      // 1. Save general settings
      const res = await updateStoreSettings({
        brand_name: brandName.trim(),
        banner_tagline: bannerTagline.trim(),
        free_delivery_enabled: freeDeliveryEnabled,
        free_delivery_threshold: Number(freeDeliveryThreshold),
        default_delivery_fee: Number(defaultDeliveryFee),
        hero_product_slug: heroProductSlug,
        sale_enabled: saleEnabled,
        sale_discount_percent: Number(saleDiscountPercent),
        contact_address: contactAddress.trim(),
        contact_phone: contactPhone.trim(),
        contact_email: contactEmail.trim(),
        whatsapp_number: whatsappNumber.trim(),
        sale_section_title: saleSectionTitle.trim(),
        sale_section_subtitle: saleSectionSubtitle.trim(),
        new_arrivals_title: newArrivalsTitle.trim(),
        new_arrivals_subtitle: newArrivalsSubtitle.trim(),
      });

      // 2. Save Profile Settings if changed
      let profileRes: { success?: boolean; error?: string } = { success: true };
      if (adminEmail || adminPassword) {
         profileRes = await updateAdminProfile({ 
            email: adminEmail ? adminEmail : undefined, 
            password: adminPassword ? adminPassword : undefined 
         });
      }

      if ('success' in res && res.success && profileRes.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('proedge_settings_updated'));
        }
        setMessage({
          type: 'success',
          text: 'Settings saved successfully!',
        });
        setAdminPassword(''); // Clear password field for safety
      } else {
        setMessage({
          type: 'error',
          text: (res as { error?: string }).error || profileRes.error || 'Failed to save settings.',
        });
      }
    });
  };

  const tabs = [
    { id: 'store', label: 'Store Details' },
    { id: 'homepage', label: 'Homepage Layout' },
    { id: 'profile', label: 'Admin Profile' },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-zinc-100 dark:bg-zinc-900 text-amber-600 dark:text-amber-500 border-b-2 border-amber-500'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          {message.text}
        </div>
      )}

      {/* STORE TAB */}
      {activeTab === 'store' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">Branding & Contact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Brand Name</label>
                <input value={brandName} onChange={e => setBrandName(e.target.value)} className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Announcement Tagline</label>
                <input value={bannerTagline} onChange={e => setBannerTagline(e.target.value)} className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Store Address</label>
                <input value={contactAddress} onChange={e => setContactAddress(e.target.value)} className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Phone Number</label>
                <input value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">WhatsApp Number (Homepage)</label>
                <input value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Support Email</label>
                <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">Delivery Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1 cursor-pointer">
                  <input type="checkbox" checked={freeDeliveryEnabled} onChange={e => setFreeDeliveryEnabled(e.target.checked)} className="accent-amber-500 w-4 h-4" />
                  Enable Free Delivery
                </label>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Threshold (LKR)</label>
                <input type="number" value={freeDeliveryThreshold} onChange={e => setFreeDeliveryThreshold(Number(e.target.value))} className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Default Fee (LKR)</label>
                <input type="number" value={defaultDeliveryFee} onChange={e => setDefaultDeliveryFee(Number(e.target.value))} className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HOMEPAGE TAB */}
      {activeTab === 'homepage' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">Hero Product</h2>
            <p className="text-xs text-zinc-500 mb-4">Select which product is featured massively at the top of the homepage.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <select value={heroProductSlug} onChange={e => setHeroProductSlug(e.target.value)} className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm">
                <option value="proedge-runner-x1">Default (PROEDGE Runner X1)</option>
                {products.map(p => (
                  <option key={p.slug} value={p.slug}>{p.name} - {formatLKR(p.price)}</option>
                ))}
              </select>

              {products.find(p => p.slug === heroProductSlug)?.images?.[0] && (
                <div className="flex items-center gap-3 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60">
                  <div className="relative w-12 h-12 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0" style={{ position: 'relative' }}>
                    <Image src={products.find(p => p.slug === heroProductSlug)!.images[0]} alt="Hero" fill className="object-cover" />
                  </div>
                  <div className="min-w-0 text-xs">
                    <p className="font-bold text-zinc-900 dark:text-white truncate">
                      {products.find(p => p.slug === heroProductSlug)?.name}
                    </p>
                    <p className="text-[11px] text-amber-500 font-bold">
                      {formatLKR(products.find(p => p.slug === heroProductSlug)!.price)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">Global Sale Banner</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1 cursor-pointer">
                  <input type="checkbox" checked={saleEnabled} onChange={e => setSaleEnabled(e.target.checked)} className="accent-amber-500 w-4 h-4" />
                  Enable Sitewide Sale
                </label>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Sale Discount %</label>
                <input type="number" value={saleDiscountPercent} onChange={e => setSaleDiscountPercent(Number(e.target.value))} className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">Section: Special Offers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Section Title</label>
                <input value={saleSectionTitle} onChange={e => setSaleSectionTitle(e.target.value)} className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Section Subtitle</label>
                <input value={saleSectionSubtitle} onChange={e => setSaleSectionSubtitle(e.target.value)} className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">Section: New Arrivals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Section Title</label>
                <input value={newArrivalsTitle} onChange={e => setNewArrivalsTitle(e.target.value)} className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Section Subtitle</label>
                <input value={newArrivalsSubtitle} onChange={e => setNewArrivalsSubtitle(e.target.value)} className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 max-w-lg">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">Update Credentials</h2>
            <p className="text-xs text-zinc-500 mb-4">Leave fields blank if you do not wish to change them.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">New Email Address</label>
                <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="Enter new email..." className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" autoComplete="off" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">New Password</label>
                <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="Enter new password..." className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" autoComplete="new-password" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="sticky bottom-0 pt-4 pb-6 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 z-10">
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-black uppercase tracking-wider text-zinc-950 shadow-md transition-all hover:bg-amber-400 hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
        >
          <Save className="h-5 w-5" />
          {isPending ? 'Saving Changes...' : 'Save All Settings'}
        </button>
      </div>
    </form>
  );
}



