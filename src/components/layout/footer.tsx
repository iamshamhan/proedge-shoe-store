'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Mail, MapPin, MessageSquare, Globe, Share2 } from 'lucide-react';
import { useStoreSettings } from '@/context/settings-context';
import { PARENT_SPORTS } from '@/data/categories';
import type { CategoryItem } from '@/types/product';

type FooterProps = {
  categories?: CategoryItem[];
};

export function Footer({ categories: propCategories }: FooterProps) {
  const pathname = usePathname();
  const {
    brandName = 'PROEDGE',
    bannerTagline,
    contactAddress,
    contactPhone,
    whatsappNumber: storeWhatsappNumber,
    contactEmail,
    saleEnabled,
    saleDiscountPercent,
  } = useStoreSettings();

  // Navigation hierarchy: prefer passed categories, fallback to PARENT_SPORTS
  const sports = propCategories && propCategories.length > 0 ? propCategories : PARENT_SPORTS;

  // Admin pages do NOT display the customer footer
  if (pathname.startsWith('/admin')) {
    return null;
  }

  // Format brand logo
  const normalizedBrand = brandName.trim() || 'PROEDGE';
  let logoPrefix = 'PRO';
  let logoSuffix = 'EDGE';
  if (normalizedBrand.toUpperCase() === 'PROEDGE') {
    logoPrefix = 'PRO';
    logoSuffix = 'EDGE';
  } else if (normalizedBrand.length > 3) {
    logoPrefix = normalizedBrand.slice(0, 3).toUpperCase();
    logoSuffix = normalizedBrand.slice(3).toUpperCase();
  } else {
    logoPrefix = normalizedBrand.toUpperCase();
    logoSuffix = '';
  }

  const cleanPhone = contactPhone ?? '';
  const cleanEmail = contactEmail ?? '';
  const cleanAddress = contactAddress || '38 Attidiya Road Kawdana Dehiwala';
  let whatsappNumber = (storeWhatsappNumber ?? '').replace(/[^0-9]/g, '');
  if (whatsappNumber.length === 10 && whatsappNumber.startsWith('0')) {
    whatsappNumber = '94' + whatsappNumber.substring(1);
  } else if (whatsappNumber.length === 9) {
    whatsappNumber = '94' + whatsappNumber;
  }

  return (
    <footer className="bg-[#f5f5f7] dark:bg-[#000000] text-[#6e6e73] dark:text-[#86868b] border-t border-black/[0.08] dark:border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-10 border-b border-black/[0.08] dark:border-white/[0.08]">
          
          {/* Brand Column (5 cols) */}
          <div className="lg:col-span-5 space-y-3.5">
            <Link href="/" className="inline-flex items-center gap-1.5 focus:outline-none">
              <span className="bg-[#1d1d1f] text-white dark:bg-white dark:text-[#1d1d1f] font-bold text-lg px-2.5 py-0.5 tracking-tight rounded-lg">
                {logoPrefix}
              </span>
              {logoSuffix && (
                <span className="font-semibold text-lg tracking-tight text-[#1d1d1f] dark:text-white">
                  {logoSuffix}
                </span>
              )}
            </Link>
            
            <p className="text-[#6e6e73] dark:text-[#86868b] text-xs sm:text-[13px] leading-relaxed max-w-sm">
              {normalizedBrand} crafts high-performance athletic footwear and sporting equipment engineered for durability, comfort, and precision.
            </p>
            <p className="text-amber-600 dark:text-amber-400 text-xs font-semibold tracking-tight">
              {bannerTagline || 'Built for your next step.'}
            </p>

            {/* Social & WhatsApp Buttons */}
            <div className="flex items-center space-x-2.5 pt-1">
              {whatsappNumber && <a
                href={whatsappNumber ? `https://wa.me/${whatsappNumber}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Support"
                className="w-9 h-9 rounded-full bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center text-[#1d1d1f] dark:text-zinc-300 hover:bg-amber-500 hover:text-zinc-950 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
              </a>}
              <Link
                href="/"
                aria-label="Official Website"
                className="w-9 h-9 rounded-full bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center text-[#1d1d1f] dark:text-zinc-300 hover:bg-amber-500 hover:text-zinc-950 transition-colors"
              >
                <Globe className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.share) {
                    navigator.share({ title: normalizedBrand, url: window.location.origin }).catch(() => {});
                  }
                }}
                aria-label="Share Store"
                className="w-9 h-9 rounded-full bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center text-[#1d1d1f] dark:text-zinc-300 hover:bg-amber-500 hover:text-zinc-950 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Shop Collections Links (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-[#1d1d1f] dark:text-white text-xs font-semibold tracking-tight">Shop &amp; Explore</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-[13px]">
              {sports.map((sport) => (
                <li key={sport.id}>
                  <Link
                    href={`/shop?category=${sport.slug}`}
                    className="hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
                  >
                    {sport.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/shop" className="hover:text-[#1d1d1f] dark:hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/sale"
                  className="text-amber-600 dark:text-amber-400 hover:underline transition-colors font-medium flex items-center gap-1.5"
                >
                  <span>Special Offers</span>
                  {saleEnabled !== false && (
                    <span className="text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2 py-0.2 rounded-full">
                      -{saleDiscountPercent ?? 30}%
                    </span>
                  )}
                </Link>
              </li>
            </ul>
          </div>

          {/* Get In Touch (3 cols) - Editable in Admin */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-[#1d1d1f] dark:text-white text-xs font-semibold tracking-tight">Contact Concierge</h3>
            <ul className="space-y-2.5 text-xs sm:text-[13px]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{cleanAddress}</span>
              </li>
              {cleanPhone && <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <a
                  href={`tel:${cleanPhone.replace(/\s+/g, '')}`}
                  className="hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
                >
                  {cleanPhone}
                </a>
              </li>}
              {cleanEmail && <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <a
                  href={`mailto:${cleanEmail}`}
                  className="hover:text-[#1d1d1f] dark:hover:text-white transition-colors break-all"
                >
                  {cleanEmail}
                </a>
              </li>}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6e6e73] dark:text-[#86868b] gap-4">
          <p>Copyright &copy; {new Date().getFullYear()} {normalizedBrand}. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link href="/policies" className="hover:text-[#1d1d1f] dark:hover:text-white transition-colors">
              Store Policies
            </Link>
            <Link href="/terms" className="hover:text-[#1d1d1f] dark:hover:text-white transition-colors">
              Terms of Use
            </Link>
            <Link href="/privacy" className="hover:text-[#1d1d1f] dark:hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/shop" className="hover:text-[#1d1d1f] dark:hover:text-white transition-colors">
              Catalog
            </Link>
            <span className="text-zinc-400 dark:text-zinc-600">Sri Lanka</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
