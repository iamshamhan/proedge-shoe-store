'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductGrid } from '@/components/ui/product-grid';
import { filterProductList } from '@/data/products';
import { Product, ProductCategory, SortOption, CategoryItem } from '@/types/product';
import { PARENT_SPORTS, NavCategory, ALL_CANONICAL_CATEGORIES } from '@/data/categories';
import {
  Filter,
  SlidersHorizontal,
  Search,
  X,
  Check,
  ChevronDown,
  Layers,
} from 'lucide-react';

interface ShopContentProps {
  initialCategory?: ProductCategory | 'all';
  pageTitle?: string;
  pageSubtitle?: string;
  products: Product[];
  categories?: CategoryItem[];
}

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Featured First', value: 'featured' },
  { label: 'Newest Releases', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

type PriceRangeKey = 'all' | 'under-10k' | '10k-20k' | '20k-30k' | 'over-30k';

const PRICE_RANGE_OPTIONS: { key: PriceRangeKey; label: string; min?: number; max?: number }[] = [
  { key: 'all', label: 'All Prices' },
  { key: 'under-10k', label: 'Under Rs. 10,000', max: 10000 },
  { key: '10k-20k', label: 'Rs. 10,000 – Rs. 20,000', min: 10000, max: 20000 },
  { key: '20k-30k', label: 'Rs. 20,000 – Rs. 30,000', min: 20000, max: 30000 },
  { key: 'over-30k', label: 'Over Rs. 30,000', min: 30000 },
];

export function ShopContent({
  initialCategory = 'all',
  pageTitle = 'PROEDGE Gear & Footwear',
  pageSubtitle = 'Engineered sports apparel, equipment, footwear, and accessories built for peak performance.',
  products,
  categories: propCategories,
}: ShopContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category');
  const urlSort = searchParams.get('sort');

  // Use categories from props or fallback to canonical PARENT_SPORTS
  const sportsHierarchy: (CategoryItem | NavCategory)[] =
    propCategories && propCategories.length > 0 ? propCategories : PARENT_SPORTS;

  // Derive selected category directly from URL query param or initialCategory prop
  const selectedCategory: ProductCategory | 'all' = urlCategory || initialCategory;

  const initialSortFromUrl: SortOption =
    urlSort === 'price-asc' ||
    urlSort === 'price-desc' ||
    urlSort === 'newest' ||
    urlSort === 'featured'
      ? urlSort
      : 'featured';

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [sortBy, setSortBy] = useState<SortOption>(initialSortFromUrl);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<PriceRangeKey>('all');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync searchQuery and sortBy when URL search/sort params change (e.g. Header search while on /shop)
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);
  if (prevUrlSearch !== urlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearchQuery(urlSearch);
  }
  const [prevUrlSort, setPrevUrlSort] = useState(urlSort);
  if (prevUrlSort !== urlSort) {
    setPrevUrlSort(urlSort);
    setSortBy(initialSortFromUrl);
  }

  // User manually toggled accordion states
  const [userExpandedSports, setUserExpandedSports] = useState<Record<string, boolean>>({});

  // Detect which sport parent should be auto-expanded based on selectedCategory
  const activeParentSlug = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'all') return null;
    const parent = sportsHierarchy.find(
      (s) =>
        s.slug === selectedCategory ||
        s.children?.some((c) => c.slug === selectedCategory),
    );
    return parent ? parent.slug : null;
  }, [selectedCategory, sportsHierarchy]);

  const isSportExpanded = (sportSlug: string) => {
    if (userExpandedSports[sportSlug] !== undefined) {
      return userExpandedSports[sportSlug];
    }
    return sportSlug === activeParentSlug;
  };

  const toggleSportAccordion = (slug: string) => {
    setUserExpandedSports((prev) => {
      const current = isSportExpanded(slug);
      return {
        ...prev,
        [slug]: !current,
      };
    });
  };

  // Update URL search parameters when category changes to keep URLs shareable
  const handleSelectCategory = (categorySlug: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (categorySlug === 'all') {
      current.delete('category');
    } else {
      current.set('category', categorySlug);
    }
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.replace(`/shop${query}`, { scroll: false });
  };

  // Filter products using robust helper + price range & sale filters
  const filteredProducts = useMemo(() => {
    const base = filterProductList(
      products,
      {
        category: selectedCategory,
        search: searchQuery,
        sortBy: sortBy,
        inStockOnly: inStockOnly,
      },
      sportsHierarchy,
    );

    const activePriceRule = PRICE_RANGE_OPTIONS.find((r) => r.key === priceRange);

    return base.filter((p) => {
      if (onSaleOnly) {
        const isDiscounted = Boolean(p.onSale || (p.compareAtPrice && p.compareAtPrice > p.price));
        if (!isDiscounted) return false;
      }
      if (activePriceRule && activePriceRule.key !== 'all') {
        if (activePriceRule.min !== undefined && p.price < activePriceRule.min) return false;
        if (activePriceRule.max !== undefined && p.price > activePriceRule.max) return false;
      }
      return true;
    });
  }, [
    products,
    selectedCategory,
    searchQuery,
    sortBy,
    inStockOnly,
    onSaleOnly,
    priceRange,
    sportsHierarchy,
  ]);

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    Boolean(searchQuery) ||
    inStockOnly ||
    onSaleOnly ||
    priceRange !== 'all';

  const handleClearFilters = () => {
    setSearchQuery('');
    setSortBy('featured');
    setInStockOnly(false);
    setOnSaleOnly(false);
    setPriceRange('all');

    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.delete('category');
    current.delete('search');
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.replace(`/shop${query}`, { scroll: false });
  };

  // Find human-readable label of the currently selected category (checking live DB categories first)
  const selectedCategoryLabel = useMemo(() => {
    if (selectedCategory === 'all') return 'All Categories';
    for (const parent of sportsHierarchy) {
      if (parent.slug === selectedCategory) return parent.name;
      const child = parent.children?.find((c) => c.slug === selectedCategory);
      if (child) return child.name;
    }
    const found = ALL_CANONICAL_CATEGORIES.find((c) => c.slug === selectedCategory);
    return found ? found.name : selectedCategory.replace(/-/g, ' ');
  }, [selectedCategory, sportsHierarchy]);

  // Reusable Category Tree component for desktop & mobile
  const renderCategoryTree = (onSelectAfter?: () => void) => (
    <div className="space-y-1.5" role="navigation" aria-label="Category Filters">
      {/* All Products button */}
      <button
        type="button"
        onClick={() => {
          handleSelectCategory('all');
          onSelectAfter?.();
        }}
        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-between ${
          selectedCategory === 'all'
            ? 'bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 font-black shadow-sm'
            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
        }`}
      >
        <span className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-amber-500 dark:text-zinc-950" />
          <span>All Products</span>
        </span>
        {selectedCategory === 'all' && (
          <Check className="w-3.5 h-3.5 text-amber-400 dark:text-zinc-950" />
        )}
      </button>

      {/* Parent Sports & Subcategories */}
      <div className="pt-2 space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-2 block mb-1">
          Sports &amp; Departments
        </span>

        {sportsHierarchy.map((sport) => {
          const isSportSelected = selectedCategory === sport.slug;
          const hasChildren = sport.children && sport.children.length > 0;
          const isExpanded = isSportExpanded(sport.slug);
          const hasSelectedChild =
            hasChildren && sport.children!.some((c) => c.slug === selectedCategory);

          return (
            <div
              key={sport.id}
              className={`rounded-xl border transition-all ${
                isSportSelected || hasSelectedChild
                  ? 'border-amber-400/40 bg-amber-50/20 dark:border-amber-500/30 dark:bg-amber-950/10'
                  : 'border-transparent'
              }`}
            >
              {/* Sport Parent Row */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    handleSelectCategory(sport.slug);
                    onSelectAfter?.();
                  }}
                  className={`flex-1 text-left px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-between rounded-lg ${
                    isSportSelected
                      ? 'bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 font-black'
                      : 'text-zinc-800 dark:text-zinc-200 hover:text-amber-600 dark:hover:text-amber-400'
                  }`}
                >
                  <span>{sport.name}</span>
                  {isSportSelected && (
                    <Check className="w-3.5 h-3.5 text-amber-400 dark:text-zinc-950" />
                  )}
                </button>

                {/* Accordion Expand/Collapse button */}
                {hasChildren && (
                  <button
                    type="button"
                    onClick={() => toggleSportAccordion(sport.slug)}
                    aria-label={`Toggle ${sport.name} subcategories`}
                    aria-expanded={isExpanded}
                    className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-amber-500' : ''
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Child Subcategories List */}
              {hasChildren && isExpanded && (
                <div className="pl-3 pr-1 py-1 space-y-0.5 border-l-2 border-amber-400/40 dark:border-amber-500/30 ml-3 my-1">
                  {sport.children!.map((child) => {
                    const isChildSelected = selectedCategory === child.slug;

                    return (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => {
                          handleSelectCategory(child.slug);
                          onSelectAfter?.();
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center justify-between ${
                          isChildSelected
                            ? 'bg-amber-500 text-zinc-950 font-black'
                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        <span className="truncate">{child.name}</span>
                        {isChildSelected && <Check className="w-3 h-3 text-zinc-950" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legacy Fallback Categories for Storefront Continuity */}
      <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-800/80">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-2 block mb-1">
          Classic Shoe Lines
        </span>
        <div className="space-y-0.5">
          {[
            { label: "Men's Footwear", slug: 'men' },
            { label: "Women's Footwear", slug: 'women' },
            { label: 'Sports & Training', slug: 'sports' },
            { label: 'Casual Lifestyle', slug: 'casual' },
          ].map((legacy) => {
            const isSelected = selectedCategory === legacy.slug;
            return (
              <button
                key={legacy.slug}
                type="button"
                onClick={() => {
                  handleSelectCategory(legacy.slug);
                  onSelectAfter?.();
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                  isSelected
                    ? 'bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 font-bold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>{legacy.label}</span>
                {isSelected && <Check className="w-3 h-3 text-amber-400 dark:text-zinc-950" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="py-10 sm:py-16 bg-zinc-50 dark:bg-zinc-950 min-h-screen transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title Section */}
        <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-8">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block mb-1">
            PROEDGE Catalog
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
            {pageTitle}
          </h1>
          <p className="mt-3 text-zinc-500 dark:text-zinc-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            {pageSubtitle}
          </p>
        </div>

        {/* Top Control Bar (Search, Active Filter Count, Sort, Mobile Filter Toggle) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          {/* Search Input Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
            <label htmlFor="shop-search" className="sr-only">
              Filter by name or style
            </label>
            <input
              id="shop-search"
              type="text"
              placeholder="Search gear, boots, balls, bags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-full text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-amber-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-full text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-500" />
              <span>Filters</span>
              {selectedCategory !== 'all' && (
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>

            {/* Sort Selector */}
            <div className="relative flex items-center">
              <span className="hidden sm:inline-block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mr-2">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort products"
                className="px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-full text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-amber-500 cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Catalog Layout (Sidebar + Product Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-200 dark:border-zinc-800 soft-shadow h-fit transition-colors sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-500" />
                <span>Filter Catalog</span>
              </h3>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Category Filter Tree */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Department
              </h4>
              {renderCategoryTree()}
            </div>

            {/* Price Range Filter */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Price Range (LKR)
              </h4>
              <div className="space-y-1">
                {PRICE_RANGE_OPTIONS.map((range) => {
                  const active = priceRange === range.key;
                  return (
                    <button
                      key={range.key}
                      type="button"
                      onClick={() => setPriceRange(range.key)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                        active
                          ? 'bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 font-bold'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      <span>{range.label}</span>
                      {active && <Check className="w-3.5 h-3.5 text-amber-400 dark:text-zinc-950" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Availability & Deals Toggles */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-zinc-900 dark:text-amber-500 focus:ring-zinc-900 dark:focus:ring-amber-500 border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950"
                />
                <span>In Stock Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={onSaleOnly}
                  onChange={(e) => setOnSaleOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-zinc-900 dark:text-amber-500 focus:ring-zinc-900 dark:focus:ring-amber-500 border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950"
                />
                <span>On Sale / Discounted</span>
              </label>
            </div>

            {/* Store Information Card */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
              <p className="font-bold text-zinc-800 dark:text-zinc-200">All prices in LKR</p>
              <p>Islandwide courier shipping available across Sri Lanka.</p>
            </div>
          </div>

          {/* Product Grid Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Active filter pills & count bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium px-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-zinc-700 dark:text-zinc-300">
                  Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
                </span>
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 rounded-full font-bold uppercase text-[10px]">
                    <span>{selectedCategoryLabel}</span>
                    <button
                      type="button"
                      onClick={() => handleSelectCategory('all')}
                      aria-label="Remove category filter"
                      className="hover:text-amber-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {priceRange !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-full font-bold uppercase text-[10px]">
                    <span>{PRICE_RANGE_OPTIONS.find((r) => r.key === priceRange)?.label}</span>
                    <button
                      type="button"
                      onClick={() => setPriceRange('all')}
                      aria-label="Remove price filter"
                      className="hover:text-amber-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {onSaleOnly && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 rounded-full font-bold uppercase text-[10px]">
                    <span>On Sale</span>
                    <button
                      type="button"
                      onClick={() => setOnSaleOnly(false)}
                      aria-label="Remove sale filter"
                      className="hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-full font-bold uppercase text-[10px]">
                    <span>In Stock</span>
                    <button
                      type="button"
                      onClick={() => setInStockOnly(false)}
                      aria-label="Remove in stock filter"
                      className="hover:text-emerald-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-full font-bold text-[10px]">
                    <span>&ldquo;{searchQuery}&rdquo;</span>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search query"
                      className="hover:text-amber-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            <ProductGrid products={filteredProducts} />
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
            aria-hidden="true"
          />

          {/* Modal Panel */}
          <div className="relative w-full max-w-xs sm:max-w-sm bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col z-10 p-6 overflow-y-auto transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-500" />
                <span>Filter Products</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                aria-label="Close filters"
                className="p-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 space-y-6 flex-1 overflow-y-auto">
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Select Department
                </h4>
                {renderCategoryTree(() => setIsMobileFilterOpen(false))}
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Price Range (LKR)
                </h4>
                <div className="space-y-1">
                  {PRICE_RANGE_OPTIONS.map((range) => {
                    const active = priceRange === range.key;
                    return (
                      <button
                        key={range.key}
                        type="button"
                        onClick={() => setPriceRange(range.key)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                          active
                            ? 'bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 font-bold'
                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <span>{range.label}</span>
                        {active && <Check className="w-3.5 h-3.5 text-amber-400 dark:text-zinc-950" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-zinc-900 dark:text-amber-500 border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 focus:ring-zinc-900 dark:focus:ring-amber-500"
                  />
                  <span>In Stock Only</span>
                </label>

                <label className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onSaleOnly}
                    onChange={(e) => setOnSaleOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-zinc-900 dark:text-amber-500 border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 focus:ring-zinc-900 dark:focus:ring-amber-500"
                  />
                  <span>On Sale / Discounted</span>
                </label>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800 flex gap-2">
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex-1 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-full text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 rounded-full text-sm font-bold hover:bg-amber-600 dark:hover:bg-amber-400 transition-colors soft-shadow"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
