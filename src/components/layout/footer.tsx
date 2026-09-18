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

  const cleanPhone = contactPhone || '+94 11 234 5678';
  const cleanEmail = contactEmail || 'support@proedge.lk';
  const cleanAddress = contactAddress || 'Galle Road, Colombo 03, Sri Lanka';
  const whatsappNumber = cleanPhone.replace(/[^0-9]/g, '');

  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-zinc-800">
          
          {/* Brand Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Link href="/" className="inline-flex items-center gap-1.5 focus:outline-none">
              <span className="bg-white text-zinc-950 font-black text-2xl px-2.5 py-1 tracking-wider uppercase rounded-xs">
                {logoPrefix}
              </span>
              {logoSuffix && (
                <span className="font-black text-2xl tracking-widest text-white uppercase">
                  {logoSuffix}
                </span>
              )}
            </Link>
            
            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
              {normalizedBrand} designs high-performance athletic and lifestyle footwear engineered for durability, comfort, and uncompromising street style.
            </p>
            <p className="text-amber-500 text-xs font-semibold uppercase tracking-wider">
              {bannerTagline || 'Built for Your Next Step.'}
            </p>

            {/* Social & WhatsApp Buttons */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                href={whatsappNumber ? `https://wa.me/${whatsappNumber}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Support"
                className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-300 hover:text-amber-500 hover:bg-zinc-800 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <Link
                href="/"
                aria-label="Official Website"
                className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-300 hover:text-amber-500 hover:bg-zinc-800 transition-colors"
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
                className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-300 hover:text-amber-500 hover:bg-zinc-800 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Shop Collections Links (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-white text-xs font-bold uppercase tracking-wider">Shop Collections</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
              {sports.map((sport) => (
                <li key={sport.id}>
                  <Link
                    href={`/shop?category=${sport.slug}`}
                    className="hover:text-amber-400 transition-colors"
                  >
                    {sport.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/shop" className="hover:text-amber-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/sale"
                  className="text-amber-400 hover:text-amber-300 transition-colors font-medium flex items-center gap-1.5"
                >
                  <span>Sale Offers</span>
                  {saleEnabled !== false && (
                    <span className="text-[10px] font-black bg-amber-500 text-zinc-950 px-1.5 py-0.2 rounded-full">
                      {saleDiscountPercent ?? 30}%
                    </span>
                  )}
                </Link>
              </li>
            </ul>
          </div>

          {/* Get In Touch (3 cols) - Editable in Admin */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-white text-xs font-bold uppercase tracking-wider">Get In Touch</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{cleanAddress}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <a
                  href={`tel:${cleanPhone.replace(/\s+/g, '')}`}
                  className="hover:text-amber-400 transition-colors"
                >
                  {cleanPhone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <a
                  href={`mailto:${cleanEmail}`}
                  className="hover:text-amber-400 transition-colors break-all"
                >
                  {cleanEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>&copy; {new Date().getFullYear()} {normalizedBrand} Footwear. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <Link href="/shop" className="hover:text-zinc-400 transition-colors">
              Footwear Catalog
            </Link>
            <Link href="/sale" className="hover:text-zinc-400 transition-colors">
              Special Deals
            </Link>
            <span className="text-zinc-600">Sri Lanka Courier Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
