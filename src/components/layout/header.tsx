'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ArrowRight,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  Sparkles,
  LayoutDashboard,
  Package,
  Sliders,
  LogOut,
  ExternalLink,
  FolderTree,
} from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';
import { useStoreSettings } from '@/context/settings-context';
import { useTheme } from '@/context/theme-context';
import { PARENT_SPORTS, NavCategory } from '@/data/categories';
import type { CategoryItem } from '@/types/product';
import { signOut } from '@/app/admin/actions';

interface HeaderProps {
  categories?: CategoryItem[];
}

export function Header({ categories: propCategories }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItemsCount } = useCart();
  const { productIds: wishlistIds } = useWishlist();
  const {
    freeDeliveryEnabled,
    freeDeliveryThreshold,
    bannerTagline,
    saleEnabled,
    saleDiscountPercent,
    brandName,
  } = useStoreSettings();
  const { theme, toggleTheme } = useTheme();

  const isAdminRoute = pathname.startsWith('/admin');

  const normalizedBrand = (brandName || 'PROEDGE').trim();
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

  // Navigation hierarchy: prefer passed categories, fallback to canonical PARENT_SPORTS
  const sports: (NavCategory | CategoryItem)[] =
    propCategories && propCategories.length > 0 ? propCategories : PARENT_SPORTS;

  // Desktop dropdown state
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileSports, setExpandedMobileSports] = useState<Record<string, boolean>>({});

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Close mobile menu & active dropdown on route changes
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }

  // Handle desktop dropdown hover with subtle delay to prevent accidental closing
  const handleMouseEnter = (slug: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(slug);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const toggleMobileSport = (slug: string) => {
    setExpandedMobileSports((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Keyboard navigation for dropdowns
  const handleDropdownKeyDown = (e: React.KeyboardEvent, slug: string) => {
    if (e.key === 'Escape') {
      setActiveDropdown(null);
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (activeDropdown === slug) {
        setActiveDropdown(null);
      } else {
        e.preventDefault();
        setActiveDropdown(slug);
      }
    }
  };

  return (
    <>
      {/* Skip to content */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-zinc-900 focus:text-white dark:focus:bg-amber-500 dark:focus:text-zinc-950 focus:font-bold focus:text-sm focus:rounded-lg"
      >
        Skip to content
      </a>

      {/* Top Banner */}
      <div className="bg-zinc-900 text-zinc-100 text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 transition-all border-b border-zinc-800/80">
        {freeDeliveryEnabled ? (
          <>
            <span>
              Islandwide Free Delivery on Orders Over Rs. {freeDeliveryThreshold.toLocaleString()}
            </span>
            <span className="hidden sm:inline-block text-amber-500">•</span>
            <span className="hidden sm:inline-block text-zinc-400">{bannerTagline}</span>
          </>
        ) : (
          <>
            <span>Islandwide Courier Delivery Across Sri Lanka</span>
            <span className="hidden sm:inline-block text-amber-500">•</span>
            <span className="hidden sm:inline-block text-zinc-400">{bannerTagline}</span>
          </>
        )}
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Toggle Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle navigation menu"
                aria-expanded={isMobileMenuOpen}
                className="p-2.5 sm:p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center -ml-2 rounded-md text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-amber-500 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex-shrink-0 flex items-center mr-4">
              <Link
                href={isAdminRoute ? '/admin' : '/'}
                className="group flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-amber-500 focus-visible:rounded-sm"
              >
                <span className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-black text-lg sm:text-xl px-2.5 py-0.5 tracking-wider uppercase rounded-sm group-hover:bg-amber-600 dark:group-hover:bg-amber-500 dark:group-hover:text-zinc-950 transition-colors">
                  {logoPrefix}
                </span>
                {logoSuffix && (
                  <span className="font-black text-lg sm:text-xl tracking-widest text-zinc-900 dark:text-white uppercase">
                    {logoSuffix}
                  </span>
                )}
                {isAdminRoute && (
                  <span className="ml-1.5 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    Admin
                  </span>
                )}
              </Link>
            </div>

            {/* Navigation: Admin Navigation vs Customer Navigation */}
            {isAdminRoute ? (
              <nav
                className="hidden lg:flex items-center space-x-2 xl:space-x-3"
                aria-label="Admin Navigation"
              >
                <Link
                  href="/admin"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs xl:text-[13px] font-semibold tracking-wider uppercase rounded-lg transition-colors ${
                    pathname === '/admin'
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-amber-600 dark:text-amber-400 font-extrabold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/admin/products"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs xl:text-[13px] font-semibold tracking-wider uppercase rounded-lg transition-colors ${
                    pathname.startsWith('/admin/products')
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-amber-600 dark:text-amber-400 font-extrabold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Products</span>
                </Link>
                <Link href="/admin/categories" className={`flex items-center gap-1.5 px-3 py-1.5 text-xs xl:text-[13px] font-semibold tracking-wider uppercase rounded-lg transition-colors ${pathname.startsWith("/admin/categories") ? "bg-zinc-100 dark:bg-zinc-800 text-amber-600 dark:text-amber-400 font-extrabold" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"}`}><FolderTree className="w-4 h-4" /><span>Categories</span></Link>
                  <Link
                    href="/admin/settings"
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs xl:text-[13px] font-semibold tracking-wider uppercase rounded-lg transition-colors ${
                    pathname === '/admin/settings'
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-amber-600 dark:text-amber-400 font-extrabold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
              </nav>
            ) : (
              <nav
                className="hidden lg:flex items-center space-x-2 xl:space-x-6"
                aria-label="Main Navigation"
              >
                {/* All Shop Link */}
                <Link
                  href="/shop"
                  className={`px-2.5 py-1.5 text-xs xl:text-[13px] font-semibold tracking-wider uppercase transition-colors rounded hover:text-zinc-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                    pathname === '/shop'
                      ? 'text-zinc-900 dark:text-amber-400 font-extrabold'
                      : 'text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  Shop All
                </Link>

                {/* Primary Sports with Hover/Focus Dropdowns */}
                {sports.map((sport) => {
                  const hasChildren = sport.children && sport.children.length > 0;
                  const isDropdownActive = activeDropdown === sport.slug;
                  const isCurrentCategory = pathname.includes(sport.slug);

                  return (
                    <div
                      key={sport.id}
                      className="relative group"
                      onMouseEnter={() => handleMouseEnter(sport.slug)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="flex items-center">
                        <Link
                          href={`/shop?category=${sport.slug}`}
                          onKeyDown={(e) => handleDropdownKeyDown(e, sport.slug)}
                          aria-haspopup={hasChildren ? 'true' : undefined}
                          aria-expanded={hasChildren ? isDropdownActive : undefined}
                          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs xl:text-[13px] font-semibold tracking-wider uppercase transition-colors rounded hover:text-zinc-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                            isDropdownActive || isCurrentCategory
                              ? 'text-zinc-900 dark:text-amber-400 font-extrabold'
                              : 'text-zinc-600 dark:text-zinc-300'
                          }`}
                        >
                          <span>{sport.name}</span>
                          {hasChildren && (
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                isDropdownActive ? 'rotate-180 text-amber-500' : 'text-zinc-400'
                              }`}
                            />
                          )}
                        </Link>
                      </div>

                      {/* Desktop Dropdown Card */}
                      {hasChildren && isDropdownActive && (
                        <div
                          role="menu"
                          aria-label={`${sport.name} Subcategories`}
                          className="absolute left-0 top-full pt-3 z-50 w-64 xl:w-72 transition-all animate-in fade-in-50 slide-in-from-top-2 duration-150"
                        >
                          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-3 overflow-hidden">
                            {/* Dropdown Header link */}
                            <div className="pb-2 mb-2 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                              <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                {sport.name} Gear
                              </span>
                              <Link
                                href={`/shop?category=${sport.slug}`}
                                onClick={() => setActiveDropdown(null)}
                                className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-0.5"
                              >
                                <span>View All</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>

                            {/* Subcategory links */}
                            <div className="space-y-0.5">
                              {sport.children!.map((sub) => (
                                <Link
                                  key={sub.id}
                                  href={`/shop?category=${sub.slug}`}
                                  role="menuitem"
                                  onClick={() => setActiveDropdown(null)}
                                  className="group/item flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-amber-50 dark:hover:bg-zinc-800 hover:text-amber-700 dark:hover:text-amber-400 rounded-lg transition-colors"
                                >
                                  <span>{sub.name}</span>
                                  <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-600 group-hover/item:text-amber-500 group-hover/item:translate-x-0.5 transition-all" />
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Sale Link with Badge */}
                <Link
                  href="/sale"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs xl:text-[13px] font-semibold tracking-wider uppercase transition-colors rounded hover:text-zinc-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                    pathname === '/sale'
                      ? 'text-zinc-900 dark:text-amber-400 font-extrabold'
                      : 'text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  <span>Sale</span>
                  {saleEnabled !== false && (
                    <span className="px-1.5 py-0.5 text-[10px] font-black bg-amber-500 text-zinc-950 rounded-full">
                      {saleDiscountPercent ?? 30}% OFF
                    </span>
                  )}
                </Link>
              </nav>
            )}

            {/* Action Buttons */}
            {isAdminRoute ? (
              <div className="flex items-center space-x-1 sm:space-x-2">
                {/* Theme Toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  className="p-2.5 sm:p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-amber-400 dark:hover:bg-zinc-800 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-zinc-700" />
                  )}
                </button>

                {/* View Storefront */}
                <Link
                  href="/"
                  target="_blank"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="View customer store"
                >
                  <span>Store</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                {/* Logout Button */}
                <form action={signOut}>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                    title="Sign out of admin"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2">
                {/* Theme Toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  className="p-2.5 sm:p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-amber-400 dark:hover:bg-zinc-800 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-zinc-700" />
                  )}
                </button>

                {/* Search Toggle */}
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  aria-label="Open search bar"
                  aria-expanded={isSearchOpen}
                  className="p-2.5 sm:p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-800 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-amber-500"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Wishlist */}
                <Link
                  href="/wishlist"
                  aria-label={`Wishlist, ${wishlistIds.length} ${
                    wishlistIds.length === 1 ? 'item' : 'items'
                  } saved`}
                  className="p-2.5 sm:p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-800 rounded-full transition-colors relative focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-amber-500"
                >
                  <Heart className="w-5 h-5" />
                  {wishlistIds.length > 0 && (
                    <span className="absolute top-1 right-1 bg-amber-500 text-zinc-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {wishlistIds.length > 9 ? '9+' : wishlistIds.length}
                    </span>
                  )}
                </Link>

                {/* Cart Link */}
                <Link
                  href="/cart"
                  aria-label={`Shopping cart, ${totalItemsCount} ${
                    totalItemsCount === 1 ? 'item' : 'items'
                  }`}
                  className="p-2.5 sm:p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-800 rounded-full transition-colors relative focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-amber-500"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {totalItemsCount > 0 && (
                    <span className="absolute top-1 right-1 bg-amber-500 text-zinc-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                      {totalItemsCount > 9 ? '9+' : totalItemsCount}
                    </span>
                  )}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Expandable Search Input Bar */}
        {isSearchOpen && (
          <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 py-3 px-4 sm:px-6 lg:px-8 transition-colors">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="absolute left-3 w-5 h-5 text-zinc-400" />
                <label htmlFor="site-search" className="sr-only">
                  Search catalog
                </label>
                <input
                  id="site-search"
                  type="search"
                  placeholder="Search football boots, rugby balls, running shoes, gym bags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-20 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-amber-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-3 py-1.5 bg-zinc-900 text-white dark:bg-amber-500 dark:text-zinc-950 text-xs font-semibold rounded hover:bg-zinc-800 dark:hover:bg-amber-400 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400"
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
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-xs sm:max-w-sm bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col z-10 p-5 overflow-y-auto overflow-x-hidden transition-colors">
            {/* Drawer Header with Logo & Close Button */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <Link
                href={isAdminRoute ? '/admin' : '/'}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
              >
                <span className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-black text-lg px-2 py-0.5 uppercase rounded-xs">
                  {logoPrefix}
                </span>
                {logoSuffix && (
                  <span className="font-black text-lg tracking-widest text-zinc-900 dark:text-white uppercase">
                    {logoSuffix}
                  </span>
                )}
                {isAdminRoute && (
                  <span className="ml-1 px-1.5 py-0.2 text-[9px] font-black uppercase rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    Admin
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
                className="p-2.5 sm:p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-md focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isAdminRoute ? (
              <div className="py-4 space-y-2 flex-1">
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold uppercase tracking-wider ${
                    pathname === '/admin'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-extrabold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-amber-500" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/admin/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold uppercase tracking-wider ${
                    pathname.startsWith('/admin/products')
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-extrabold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Package className="w-4 h-4 text-amber-500" />
                  <span>Products</span>
                </Link>
                <Link href="/admin/categories" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold uppercase tracking-wider ${pathname.startsWith("/admin/categories") ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-extrabold" : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}><FolderTree className="w-4 h-4 text-amber-500" /><span>Categories</span></Link>
                  <Link
                    href="/admin/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold uppercase tracking-wider ${
                    pathname === '/admin/settings'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-extrabold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-amber-500" />
                  <span>Settings</span>
                </Link>
                <Link
                  href="/"
                  target="_blank"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <ExternalLink className="w-4 h-4 text-zinc-400" />
                    <span>View Customer Store</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                </Link>
                <form action={signOut} className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </form>
              </div>
            ) : (
              <>
                {/* Quick Link: Shop All */}
                <div className="py-3 border-b border-zinc-100 dark:border-zinc-800/80">
                  <Link
                    href="/shop"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 text-sm font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    <span>Browse All Products</span>
                    <ArrowRight className="w-4 h-4 text-amber-500" />
                  </Link>
                </div>

                {/* Accordion List for Primary Sports */}
                <div className="py-3 space-y-1 flex-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-1 block mb-1">
                    Shop by Sport & Category
                  </span>

                  {sports.map((sport) => {
                    const hasChildren = sport.children && sport.children.length > 0;
                    const isExpanded = !!expandedMobileSports[sport.slug];

                    return (
                      <div
                        key={sport.id}
                        className="overflow-hidden mb-1"
                      >
                        {/* Sport Header Button */}
                        <div className="flex items-center justify-between px-2 py-2">
                          <Link
                            href={`/shop?category=${sport.slug}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white hover:text-amber-500 transition-colors"
                          >
                            {sport.name}
                          </Link>

                          {hasChildren && (
                            <button
                              type="button"
                              onClick={() => toggleMobileSport(sport.slug)}
                              aria-expanded={isExpanded}
                              aria-controls={`mobile-sub-${sport.slug}`}
                              aria-label={`Toggle ${sport.name} categories`}
                              className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
                            >
                              <ChevronDown
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-180 text-amber-500' : ''
                                }`}
                              />
                            </button>
                          )}
                        </div>

                        {/* Expandable Subcategories */}
                        {hasChildren && isExpanded && (
                          <div
                            id={`mobile-sub-${sport.slug}`}
                            role="region"
                            aria-label={`${sport.name} Subcategories`}
                            className="px-4 py-1 space-y-2"
                          >
                            <Link
                              href={`/shop?category=${sport.slug}`}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                            >
                              All {sport.name} &rarr;
                            </Link>
                            {sport.children!.map((sub) => (
                              <Link
                                key={sub.id}
                                href={`/shop?category=${sub.slug}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block py-1 text-xs text-zinc-600 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Sale Link */}
                  <div className="pt-2">
                    <Link
                      href="/sale"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Special Offers & Sale</span>
                      </span>
                      {saleEnabled !== false && (
                        <span className="px-1.5 py-0.5 text-[10px] font-black bg-amber-500 text-zinc-950 rounded-full">
                          {saleDiscountPercent ?? 30}% OFF
                        </span>
                      )}
                    </Link>
                  </div>


                </div>
              </>
            )}

            {/* Mobile Theme Toggle Row */}
            <div className="pt-3 pb-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:text-amber-600 transition-colors"
              >
                <span className="flex items-center gap-2">
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-zinc-600" />
                  )}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
                  Switch
                </span>
              </button>
            </div>

            {/* Store Information Card */}
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1">
                <p className="font-bold text-zinc-800 dark:text-zinc-200">PROEDGE Storefront</p>
                <p>Built for Your Next Step</p>
                <p className="text-amber-600 dark:text-amber-400 font-medium">
                  Islandwide Delivery in Sri Lanka
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

