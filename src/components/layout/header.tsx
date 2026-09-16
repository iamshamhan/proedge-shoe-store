'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Heart, ShoppingBag, Menu, X, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';
import { CartDrawer } from '@/components/cart/cart-drawer';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Men', href: '/men' },
  { label: 'Women', href: '/women' },
  { label: 'Sports', href: '/sports' },
  { label: 'Sale', href: '/sale', badge: '30% OFF' },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItemsCount, setIsCartDrawerOpen } = useCart();
  const { productIds: wishlistIds } = useWishlist();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Skip to content */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-zinc-900 focus:text-white focus:font-bold focus:text-sm focus:rounded-lg"
      >
        Skip to content
      </a>

      {/* Top Banner */}
      <div className="bg-zinc-900 text-zinc-100 text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <span>Islandwide Free Delivery on Orders Over Rs. 30,000</span>
        <span className="hidden sm:inline-block text-amber-500">•</span>
        <span className="hidden sm:inline-block text-zinc-400">Built for Your Next Step</span>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20">
            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle navigation menu"
                aria-expanded={isMobileMenuOpen}
                className="p-2 -ml-2 rounded-md text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="group flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:rounded-sm">
                <span className="bg-zinc-900 text-white font-black text-xl sm:text-2xl px-2.5 py-1 tracking-wider uppercase rounded-sm group-hover:bg-amber-600 transition-colors">
                  PRO
                </span>
                <span className="font-black text-xl sm:text-2xl tracking-widest text-zinc-900 uppercase">
                  EDGE
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative py-1 text-sm font-semibold tracking-wider uppercase transition-colors hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:rounded-sm ${
                      isActive ? 'text-zinc-900 font-bold' : 'text-zinc-600'
                    }`}
                  >
                    {item.label}
                    {item.badge && (
                      <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-zinc-900 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Action Buttons (Search, Wishlist, Cart) */}
            <div className="flex items-center space-x-1 sm:space-x-3">
              {/* Search Toggle */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Open search bar"
                aria-expanded={isSearchOpen}
                className="p-2 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                aria-label={`Wishlist, ${wishlistIds.length} ${wishlistIds.length === 1 ? 'item' : 'items'} saved`}
                className="p-2 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors relative focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
              >
                <Heart className="w-5 h-5" />
                {wishlistIds.length > 0 && (
                  <span className="absolute top-1 right-1 bg-amber-500 text-zinc-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistIds.length > 9 ? '9+' : wishlistIds.length}
                  </span>
                )}
              </Link>

              {/* Cart Toggle */}
              <button
                type="button"
                onClick={() => setIsCartDrawerOpen(true)}
                aria-label="Open Shopping Cart"
                className="p-2 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors relative focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItemsCount > 0 && (
                  <span className="absolute top-1 right-1 bg-amber-500 text-zinc-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {totalItemsCount > 9 ? '9+' : totalItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Global Cart Drawer */}
        <CartDrawer />

        {/* Expandable Search Input Bar */}
        {isSearchOpen && (
          <div className="border-t border-zinc-200 bg-zinc-50 py-3 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="absolute left-3 w-5 h-5 text-zinc-400" />
                <label htmlFor="site-search" className="sr-only">
                  Search footwear
                </label>
                <input
                  id="site-search"
                  type="search"
                  placeholder="Search footwear (e.g. Runner, Street, Trail)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-20 py-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-3 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded hover:bg-zinc-800 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-6 border-b border-zinc-200">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 rounded"
              >
                <span className="bg-zinc-900 text-white font-black text-lg px-2 py-0.5 uppercase rounded-xs">
                  PRO
                </span>
                <span className="font-black text-lg tracking-widest text-zinc-900 uppercase">
                  EDGE
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
                className="p-2 text-zinc-500 hover:text-zinc-900 rounded-md focus-visible:ring-2 focus-visible:ring-zinc-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col py-6 space-y-4">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between py-2 text-base font-medium tracking-wide transition-colors ${
                      isActive ? 'text-zinc-900 font-bold' : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge ? (
                      <span className="px-2 py-0.5 text-xs font-bold bg-amber-500 text-zinc-900 rounded-full">
                        {item.badge}
                      </span>
                    ) : (
                      <ArrowRight className="w-4 h-4 text-zinc-400" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pt-6 border-t border-zinc-200">
              <div className="text-xs text-zinc-500 space-y-2">
                <p className="font-semibold text-zinc-800">PROEDGE Storefront</p>
                <p>Built for Your Next Step</p>
                <p className="text-amber-600 font-medium">Islandwide Delivery in Sri Lanka</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}