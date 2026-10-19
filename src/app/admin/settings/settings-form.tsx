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
  const [brandName, setBrandName] = useState(initialSettings.brandName || 'Pro Edge');
  const [bannerTagline, setBannerTagline] = useState(initialSettings.bannerTagline || 'Built for Your Next Step');
  const [contactAddress, setContactAddress] = useState(initialSettings.contactAddress || '38 Attidiya Road Kawdana Dehiwala');
  const [contactPhone, setContactPhone] = useState(initialSettings.contactPhone || '+94 76 387 1280');
  const [contactEmail, setContactEmail] = useState(initialSettings.contactEmail || 'pro_edge@yahoo.com');
  const [whatsappNumber, setWhatsappNumber] = useState(initialSettings.whatsappNumber || '+94 76 387 1280');

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
      <div className="inline-flex flex-wrap gap-1.5 p-1.5 rounded-full bg-white dark:bg-[#1d1d1f] border border-black/[0.06] dark:border-white/[0.08] soft-shadow">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-semibold tracking-tight rounded-full transition-colors ${
              activeTab === tab.id
                ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] shadow-xs'
                : 'text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-sm font-semibold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          {message.text}
        </div>
      )}

      {/* STORE TAB */}
      {activeTab === 'store' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="rounded-[24px] border border-black/[0.05] dark:border-white/[0.08] bg-white dark:bg-[#1d1d1f] p-6 soft-shadow">
            <h2 className="text-sm font-semibold tracking-tight mb-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-2.5">Branding &amp; Contact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Brand Name</label>
                <input value={brandName} onChange={e => setBrandName(e.target.value)} className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.12] bg-[#f5f5f7] dark:bg-white/[0.05] px-3.5 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Announcement Tagline</label>
                <input value={bannerTagline} onChange={e => setBannerTagline(e.target.value)} className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.12] bg-[#f5f5f7] dark:bg-white/[0.05] px-3.5 py-2.5 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1.5">Store Address</label>
                <input value={contactAddress} onChange={e => setContactAddress(e.target.value)} className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.12] bg-[#f5f5f7] dark:bg-white/[0.05] px-3.5 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Direct Call Phone Number</label>
                <p className="text-[11px] text-[#6e6e73] dark:text-[#86868b] mb-1.5">Displayed in footer and contact concierge for voice calls.</p>
                <input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+94 76 387 1280" className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.12] bg-[#f5f5f7] dark:bg-white/[0.05] px-3.5 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">WhatsApp Business Number</label>
                <p className="text-[11px] text-[#6e6e73] dark:text-[#86868b] mb-1.5">Used for the floating WhatsApp button, homepage concierge, product questions, and customer checkout orders.</p>
                <input value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="+94 76 387 1280" className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.12] bg-[#f5f5f7] dark:bg-white/[0.05] px-3.5 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Support Email</label>
                <p className="text-[11px] text-[#6e6e73] dark:text-[#86868b] mb-1.5">Customer service email shown in footer and order confirmations.</p>
                <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.12] bg-[#f5f5f7] dark:bg-white/[0.05] px-3.5 py-2.5 text-sm" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-black/[0.05] dark:border-white/[0.08] bg-white dark:bg-[#1d1d1f] p-6 soft-shadow">
            <h2 className="text-sm font-semibold tracking-tight mb-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-2.5">Delivery Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold mb-1.5 cursor-pointer">
                  <input type="checkbox" checked={freeDeliveryEnabled} onChange={e => setFreeDeliveryEnabled(e.target.checked)} className="accent-amber-500 w-4 h-4" />
                  Enable Free Delivery
                </label>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Threshold (LKR)</label>
                <input type="number" value={freeDeliveryThreshold} onChange={e => setFreeDeliveryThreshold(Number(e.target.value))} className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.12] bg-[#f5f5f7] dark:bg-white/[0.05] px-3.5 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Default Fee (LKR)</label>
                <input type="number" value={defaultDeliveryFee} onChange={e => setDefaultDeliveryFee(Number(e.target.value))} className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.12] bg-[#f5f5f7] dark:bg-white/[0.05] px-3.5 py-2.5 text-sm" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HOMEPAGE TAB */}
      {activeTab === 'homepage' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="rounded-[24px] border border-black/[0.05] dark:border-white/[0.08] bg-white dark:bg-[#1d1d1f] p-6 soft-shadow">
            <h2 className="text-sm font-semibold tracking-tight mb-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-2.5">Hero Product</h2>
            <p className="text-xs text-[#6e6e73] mb-4">Select which product is featured massively at the top of the homepage.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <select value={heroProductSlug} onChange={e => setHeroProductSlug(e.target.value)} className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.12] bg-[#f5f5f7] dark:bg-white/[0.05] px-3.5 py-2.5 text-sm">
                <option value="proedge-runner-x1">Default (PROEDGE Runner X1)</option>
                {products.map(p => (
                  <option key={p.slug} value={p.slug}>{p.name} - {formatLKR(p.price)}</option>
                ))}
              </select>

              {products.find(p => p.slug === heroProductSlug)?.images?.[0] && (
                <div className="flex items-center gap-3 p-2.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-[#f5f5f7] dark:bg-white/[0.04]">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0" style={{ position: 'relative' }}>
                    <Image src={products.find(p => p.slug === heroProductSlug)!.images[0]} alt="Hero" fill className="object-cover" />
                  </div>
                  <div className="min-w-0 text-xs">
                    <p className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                      {products.find(p => p.slug === heroProductSlug)?.name}
                    </p>
                    <p className="text-[11px] text-amber-500 font-semibold">
                      {formatLKR(products.find(p => p.slug === heroProductSlug)!.price)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-black/[0.05] dark:border-white/[0.08] bg-white dark:bg-[#1d1d1f] p-6 soft-shadow">
            <h2 className="text-sm font-semibold tracking-tight mb-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-2.5">Global Sale Banner</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold mb-1.5 cursor-pointer">
                  <input type="checkbox" checked={saleEnabled} onChange={e => setSaleEnabled(e.target.checked)} className="accent-amber-500 w-4 h-4" />
                  Enable Sitewide Sale
                </label>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Sale Discount %</label>
                <input type="number" value={saleDiscountPercent} onChange={e => setSaleDiscountPercent(Number(e.target.value))} className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.12] bg-[#f5f5f7] dark:bg-white/[0.05] px-3.5 py-2.5 text-sm" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-black/[0.05] dark:border-white/[0.08] bg-white dark:bg-[#1d1d1f] p-6 soft-shadow">
            <h2 className="text-sm font-semibold tracking-tight mb-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-2.5">Section: Special Offers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Section Title</label>
                <input value={saleSectionTitle} onChange={e => setSaleSectionTitle(e.target.value)} className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.12] bg-[#f5f5f7] dark:bg-white/[0.05] px-3.5 py-2.5 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1.5">Section Subtitle</label>
                <input value={saleSectionSubtitle} onChange={e => setSaleSectionSubtitle(e.target.value)} className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.12] bg-[#f5f5f7] dark:bg-white/[0.05] px-3.5 py-2.5 text-sm" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-black/[0.05] dark:border-white/[0.08] bg-white dark:bg-[#1d1d1f] p-6 soft-shadow">
            <h2 className="text-sm font-semibold tracking-tight mb-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-2.5">Section: New Arrivals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Section Title</label>
                <input value={newArrivalsTitle} onChange={e => setNewArrivalsTitle(e.target.value)} className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.12] bg-[#f5f5f7] dark:bg-white/[0.05] px-3.5 py-2.5 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1.5">Section Subtitle</label>
                <input value={newArrivalsSubtitle} onChange={e => setNewArrivalsSubtitle(e.target.value)} className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.12] bg-[#f5f5f7] dark:bg-white/[0.05] px-3.5 py-2.5 text-sm" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="rounded-[24px] border border-black/[0.05] dark:border-white/[0.08] bg-white dark:bg-[#1d1d1f] p-6 max-w-lg soft-shadow">
            <h2 className="text-sm font-semibold tracking-tight mb-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-2.5">Update Credentials</h2>
            <p className="text-xs text-[#6e6e73] mb-4">Leave fields blank if you do not wish to change them.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5">New Email Address</label>
                <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="Enter new email..." className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.12] bg-[#f5f5f7] dark:bg-white/[0.05] px-3.5 py-2.5 text-sm" autoComplete="off" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">New Password</label>
                <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="Enter new password..." className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.12] bg-[#f5f5f7] dark:bg-white/[0.05] px-3.5 py-2.5 text-sm" autoComplete="new-password" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="sticky bottom-0 pt-4 pb-6 bg-[#f5f5f7]/90 dark:bg-black/90 apple-glass border-t border-black/[0.06] dark:border-white/[0.08] z-10">
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-4 text-sm font-semibold tracking-tight text-zinc-950 soft-shadow transition-all hover:bg-amber-400 disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          {isPending ? 'Saving Changes...' : 'Save All Settings'}
        </button>
      </div>
    </form>
  );
}



