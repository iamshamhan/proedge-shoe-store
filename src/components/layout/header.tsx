'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/ui/brand-logo';
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
  ClipboardList,
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
  const { totalItemsCount, setIsCartDrawerOpen } = useCart();
  const { productIds: wishlistIds } = useWishlist();
  const {
    freeDeliveryEnabled,
    freeDeliveryThreshold,
    bannerTagline,
    saleEnabled,
    saleDiscountPercent,
  } = useStoreSettings();
  const { theme, toggleTheme } = useTheme();

  const isAdminRoute = pathname.startsWith('/admin');


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
      <div className="bg-[#1d1d1f] text-[#f5f5f7] text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium tracking-tight flex items-center justify-center gap-2 transition-all border-b border-white/[0.06]">
        {freeDeliveryEnabled ? (
          <>
            <span>
              Free islandwide delivery on orders over Rs. {freeDeliveryThreshold.toLocaleString()}
            </span>
            <span className="hidden sm:inline-block text-amber-400">•</span>
            <span className="hidden sm:inline-block text-zinc-400">{bannerTagline}</span>
          </>
        ) : (
          <>
            <span>Islandwide courier delivery across Sri Lanka</span>
            <span className="hidden sm:inline-block text-amber-400">•</span>
            <span className="hidden sm:inline-block text-zinc-400">{bannerTagline}</span>
          </>
        )}
      </div>

      {/* Main Sticky Header (Apple Translucent Glass) */}
      <header className="sticky top-0 z-40 bg-white/75 dark:bg-black/75 apple-glass border-b border-black/[0.06] dark:border-white/[0.08] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Mobile Menu Toggle Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle navigation menu"
                aria-expanded={isMobileMenuOpen}
                className="p-2.5 sm:p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center -ml-2 rounded-full text-zinc-700 hover:text-zinc-950 hover:bg-black/[0.05] dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex-shrink-0 flex items-center mr-4">
              <Link
                href={isAdminRoute ? '/admin' : '/'}
                className="group flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-full"
              >
                <BrandLogo />
                {isAdminRoute && (
                  <span className="ml-1.5 px-2.5 py-0.5 text-[11px] font-semibold tracking-tight rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                    Admin
                  </span>
                )}
              </Link>
            </div>

            {/* Navigation: Admin Navigation vs Customer Navigation */}
            {isAdminRoute ? (
              <nav
                className="hidden lg:flex items-center space-x-1 xl:space-x-2"
                aria-label="Admin Navigation"
              >
                <Link
                  href="/admin"
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium tracking-tight rounded-full transition-all ${
                    pathname === '/admin'
                      ? 'bg-[#1d1d1f] text-white dark:bg-white dark:text-[#1d1d1f] font-semibold shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/admin/products"
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium tracking-tight rounded-full transition-all ${
                    pathname.startsWith('/admin/products')
                      ? 'bg-[#1d1d1f] text-white dark:bg-white dark:text-[#1d1d1f] font-semibold shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Products</span>
                </Link>
                <Link
                  href="/admin/categories"
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium tracking-tight rounded-full transition-all ${
                    pathname.startsWith('/admin/categories')
                      ? 'bg-[#1d1d1f] text-white dark:bg-white dark:text-[#1d1d1f] font-semibold shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <FolderTree className="w-3.5 h-3.5" />
                  <span>Categories</span>
                </Link>
                <Link
                  href="/admin/orders"
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium tracking-tight rounded-full transition-all ${
                    pathname.startsWith('/admin/orders')
                      ? 'bg-[#1d1d1f] text-white dark:bg-white dark:text-[#1d1d1f] font-semibold shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Orders</span>
                </Link>
                <Link
                  href="/admin/settings"
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium tracking-tight rounded-full transition-all ${
                    pathname === '/admin/settings'
                      ? 'bg-[#1d1d1f] text-white dark:bg-white dark:text-[#1d1d1f] font-semibold shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </Link>
              </nav>
            ) : (
              <nav
                className="hidden lg:flex items-center space-x-1 xl:space-x-3"
                aria-label="Main Navigation"
              >
                {/* All Shop Link */}
                <Link
                  href="/shop"
                  className={`px-3.5 py-1.5 text-[13px] font-medium tracking-tight transition-all rounded-full hover:text-zinc-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                    pathname === '/shop'
                      ? 'text-zinc-950 dark:text-white font-semibold bg-black/[0.05] dark:bg-white/[0.08]'
                      : 'text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  Store
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
                          className={`flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium tracking-tight transition-all rounded-full hover:text-zinc-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                            isDropdownActive || isCurrentCategory
                              ? 'text-zinc-950 dark:text-white font-semibold bg-black/[0.05] dark:bg-white/[0.08]'
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

                      {/* Desktop Dropdown Card (Apple Frosted Glass Menu) */}
                      {hasChildren && isDropdownActive && (
                        <div
                          role="menu"
                          aria-label={`${sport.name} Subcategories`}
                          className="absolute left-0 top-full pt-2.5 z-50 w-64 xl:w-72 transition-all animate-in fade-in-50 slide-in-from-top-2 duration-150"
                        >
                          <div className="bg-white/95 dark:bg-[#1d1d1f]/95 apple-glass rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.14)] border border-black/[0.06] dark:border-white/[0.08] p-3 overflow-hidden">
                            {/* Dropdown Header link */}
                            <div className="pb-2 mb-2 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between px-2">
                              <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                                Explore {sport.name}
                              </span>
                              <Link
                                href={`/shop?category=${sport.slug}`}
                                onClick={() => setActiveDropdown(null)}
                                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5"
                              >
                                <span>All</span>
                                <ChevronRight className="w-3.5 h-3.5" />
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
                                  className="group/item flex items-center justify-between px-3 py-2 text-[13px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-zinc-950 dark:hover:text-white rounded-xl transition-colors"
                                >
                                  <span>{sub.name}</span>
                                  <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 group-hover/item:text-amber-500 group-hover/item:translate-x-0.5 transition-all" />
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Sale Link with Pill Badge */}
                <Link
                  href="/sale"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium tracking-tight transition-all rounded-full hover:text-zinc-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                    pathname === '/sale'
                      ? 'text-zinc-950 dark:text-white font-semibold bg-black/[0.05] dark:bg-white/[0.08]'
                      : 'text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  <span>Offers</span>
                  {saleEnabled !== false && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:bg-amber-400/20 dark:text-amber-300 rounded-full">
                      -{saleDiscountPercent ?? 30}%
                    </span>
                  )}
                </Link>
              </nav>
            )}

            {/* Action Buttons */}
            {isAdminRoute ? (
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                {/* Theme Toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  className="p-2.5 sm:p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.05] dark:text-zinc-300 dark:hover:text-amber-400 dark:hover:bg-white/[0.08] rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-zinc-700" />
                  )}
                </button>

                {/* View Storefront */}
                <Link
                  href="/"
                  target="_blank"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] transition-colors"
                  title="View customer store"
                >
                  <span>Storefront</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                {/* Logout Button */}
                <form action={signOut}>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                    title="Sign out of admin"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                {/* Theme Toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  className="p-2.5 sm:p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.05] dark:text-zinc-300 dark:hover:text-amber-400 dark:hover:bg-white/[0.08] rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-zinc-700" />
                  )}
                </button>

                {/* Search Toggle */}
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  aria-label="Open search bar"
                  aria-expanded={isSearchOpen}
                  className="p-2.5 sm:p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.05] dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/[0.08] rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  <Search className="w-4 h-4" />
                </button>

                {/* Wishlist */}
                <Link
                  href="/wishlist"
                  aria-label={`Wishlist, ${wishlistIds.length} ${
                    wishlistIds.length === 1 ? 'item' : 'items'
                  } saved`}
                  className="p-2.5 sm:p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.05] dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/[0.08] rounded-full transition-colors relative focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  <Heart className="w-4 h-4" />
                  {wishlistIds.length > 0 && (
                    <span className="absolute top-1 right-1 bg-amber-500 text-zinc-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {wishlistIds.length > 9 ? '9+' : wishlistIds.length}
                    </span>
                  )}
                </Link>

                {/* Cart Drawer Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (pathname === '/cart' || pathname === '/checkout') {
                      router.push('/cart');
                    } else {
                      setIsCartDrawerOpen(true);
                    }
                  }}
                  aria-label={`Shopping cart, ${totalItemsCount} ${
                    totalItemsCount === 1 ? 'item' : 'items'
                  }`}
                  className="p-2.5 sm:p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.05] dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/[0.08] rounded-full transition-colors relative focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {totalItemsCount > 0 && (
                    <span className="absolute top-1 right-1 bg-amber-500 text-zinc-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {totalItemsCount > 9 ? '9+' : totalItemsCount}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Expandable Search Input Bar (Apple Spotlight Style) */}
        {isSearchOpen && (
          <div className="border-t border-black/[0.06] dark:border-white/[0.08] bg-white/90 dark:bg-[#1d1d1f]/90 apple-glass py-3.5 px-4 sm:px-6 lg:px-8 transition-colors">
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="absolute left-4 w-4 h-4 text-zinc-400" />
                <label htmlFor="site-search" className="sr-only">
                  Search catalog
                </label>
                <input
                  id="site-search"
                  type="search"
                  placeholder="Search proedge.lk for boots, running shoes, match balls..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-11 pr-24 py-2.5 bg-[#f5f5f7] dark:bg-black/60 border border-black/[0.08] dark:border-white/[0.1] rounded-full text-base sm:text-sm text-[#1d1d1f] dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-4 py-1.5 bg-[#1d1d1f] text-white dark:bg-white dark:text-[#1d1d1f] text-xs font-semibold rounded-full hover:opacity-90 transition-opacity min-h-[36px]"
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-xs sm:max-w-sm bg-white/95 dark:bg-[#1d1d1f]/95 apple-glass h-full shadow-2xl flex flex-col z-10 p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] overflow-y-auto overflow-x-hidden transition-colors border-r border-black/[0.06] dark:border-white/[0.08]">
            {/* Drawer Header with Logo & Close Button */}
            <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
              <Link
                href={isAdminRoute ? '/admin' : '/'}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-full"
              >
                <BrandLogo />
                {isAdminRoute && (
                  <span className="ml-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                    Admin
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
                className="p-2.5 sm:p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isAdminRoute ? (
              <div className="py-4 space-y-1.5 flex-1">
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-sm font-medium ${
                    pathname === '/admin'
                      ? 'bg-[#1d1d1f] text-white dark:bg-white dark:text-[#1d1d1f] font-semibold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-amber-500" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/admin/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-sm font-medium ${
                    pathname.startsWith('/admin/products')
                      ? 'bg-[#1d1d1f] text-white dark:bg-white dark:text-[#1d1d1f] font-semibold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <Package className="w-4 h-4 text-amber-500" />
                  <span>Products</span>
                </Link>
                <Link
                  href="/admin/categories"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-sm font-medium ${
                    pathname.startsWith('/admin/categories')
                      ? 'bg-[#1d1d1f] text-white dark:bg-white dark:text-[#1d1d1f] font-semibold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <FolderTree className="w-4 h-4 text-amber-500" />
                  <span>Categories</span>
                </Link>
                <Link
                  href="/admin/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-sm font-medium ${
                    pathname.startsWith('/admin/orders')
                      ? 'bg-[#1d1d1f] text-white dark:bg-white dark:text-[#1d1d1f] font-semibold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <ClipboardList className="w-4 h-4 text-amber-500" />
                  <span>Orders</span>
                </Link>
                <Link
                  href="/admin/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-sm font-medium ${
                    pathname === '/admin/settings'
                      ? 'bg-[#1d1d1f] text-white dark:bg-white dark:text-[#1d1d1f] font-semibold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-amber-500" />
                  <span>Settings</span>
                </Link>
                <Link
                  href="/"
                  target="_blank"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <ExternalLink className="w-4 h-4 text-zinc-400" />
                    <span>View Customer Store</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                </Link>
                <form action={signOut} className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </form>
              </div>
            ) : (
              <>
                {/* Quick Link: Shop All */}
                <div className="py-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                  <Link
                    href="/shop"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 px-2 text-base font-semibold tracking-tight text-[#1d1d1f] dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    <span>Explore All Gear</span>
                    <ArrowRight className="w-4 h-4 text-amber-500" />
                  </Link>
                </div>

                {/* Accordion List for Primary Sports */}
                <div className="py-3 space-y-1 flex-1">
                  <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 px-2 block mb-1">
                    Shop by Sport
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
                        <div className="flex items-center justify-between px-2 py-2 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.05]">
                          <Link
                            href={`/shop?category=${sport.slug}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-sm font-semibold text-[#1d1d1f] dark:text-white hover:text-amber-500 transition-colors"
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
                              className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-full"
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
                            className="px-4 py-1.5 space-y-2"
                          >
                            <Link
                              href={`/shop?category=${sport.slug}`}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                            >
                              All {sport.name} &rarr;
                            </Link>
                            {sport.children!.map((sub) => (
                              <Link
                                key={sub.id}
                                href={`/shop?category=${sub.slug}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block py-1 text-[13px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors"
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
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-sm font-semibold text-amber-900 dark:text-amber-300 hover:bg-amber-500/15 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Special Offers</span>
                      </span>
                      {saleEnabled !== false && (
                        <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-500 text-zinc-950 rounded-full">
                          -{saleDiscountPercent ?? 30}%
                        </span>
                      )}
                    </Link>
                  </div>
                </div>
              </>
            )}

            {/* Mobile Theme Toggle Row */}
            <div className="pt-3 pb-2 border-t border-black/[0.06] dark:border-white/[0.08]">
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full flex items-center justify-between py-2 px-1 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-amber-600 transition-colors"
              >
                <span className="flex items-center gap-2">
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-zinc-600" />
                  )}
                  <span>{theme === 'dark' ? 'Light Appearance' : 'Dark Appearance'}</span>
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-zinc-600 dark:text-zinc-300 font-medium">
                  Switch
                </span>
              </button>
            </div>

            {/* Store Information Card */}
            <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-0.5">
                <p className="font-semibold text-[#1d1d1f] dark:text-zinc-200">PROEDGE Storefront</p>
                <p>Built for your next step.</p>
                <p className="text-amber-600 dark:text-amber-400 font-medium">
                  Islandwide delivery in Sri Lanka
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

