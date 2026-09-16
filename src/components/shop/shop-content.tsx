'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductGrid } from '@/components/ui/product-grid';
import { filterProductList } from '@/data/products';
import { Product, ProductCategory, SortOption } from '@/types/product';
import { Filter, SlidersHorizontal, Search, X, Check } from 'lucide-react';

interface ShopContentProps {
  initialCategory?: ProductCategory | 'all';
  pageTitle?: string;
  pageSubtitle?: string;
  products: Product[];
}

const CATEGORIES: { label: string; value: ProductCategory | 'all' }[] = [
  { label: 'All Footwear', value: 'all' },
  { label: "Men's Shoes", value: 'men' },
  { label: "Women's Shoes", value: 'women' },
  { label: 'Sports & Training', value: 'sports' },
  { label: 'Casual Sneakers', value: 'casual' },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Featured First', value: 'featured' },
  { label: 'Newest Releases', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

export function ShopContent({
  initialCategory = 'all',
  pageTitle = 'All PROEDGE Footwear',
  pageSubtitle = 'Explore the full engineered catalog built for performance and everyday style.',
  products,
}: ShopContentProps) {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category');
  const urlSort = searchParams.get('sort');

  const initialCategoryFromUrl: ProductCategory | 'all' =
    urlCategory === 'men' ||
    urlCategory === 'women' ||
    urlCategory === 'sports' ||
    urlCategory === 'casual'
      ? urlCategory
      : initialCategory;

  const initialSortFromUrl: SortOption =
    urlSort === 'price-asc' ||
    urlSort === 'price-desc' ||
    urlSort === 'newest' ||
    urlSort === 'featured'
      ? urlSort
      : 'featured';

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>(
    initialCategoryFromUrl
  );
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [sortBy, setSortBy] = useState<SortOption>(initialSortFromUrl);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return filterProductList(products, {
      category: selectedCategory,
      search: searchQuery,
      sortBy: sortBy,
      inStockOnly: inStockOnly,
    });
  }, [products, selectedCategory, searchQuery, sortBy, inStockOnly]);

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('featured');
    setInStockOnly(false);
  };

  return (
    <div className="py-10 sm:py-16 bg-zinc-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title Section */}
        <div className="mb-8 border-b border-zinc-200 pb-8">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
            PROEDGE Catalog
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 uppercase tracking-tight">
            {pageTitle}
          </h1>
          <p className="mt-2 text-zinc-500 text-sm sm:text-base max-w-2xl">
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
              placeholder="Filter by name or style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden px-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2 hover:bg-zinc-100"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {/* Sort Selector */}
            <div className="relative flex items-center">
              <span className="hidden sm:inline-block text-xs font-bold uppercase text-zinc-400 mr-2">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 cursor-pointer"
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
          <div className="hidden lg:block space-y-8 bg-white p-6 rounded-2xl border border-zinc-200 h-fit">
            
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-500" />
                <span>Filter Products</span>
              </h3>
              {(selectedCategory !== 'all' || searchQuery || inStockOnly) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs text-amber-600 font-semibold hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Category Filter List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Categories
              </h4>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-zinc-900 text-white'
                          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                      }`}
                    >
                      <span>{cat.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* In Stock Toggle */}
            <div className="pt-4 border-t border-zinc-200">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-wider text-zinc-700">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900 border-zinc-300"
                />
                <span>In Stock Only</span>
              </label>
            </div>

            {/* Store Information Card */}
            <div className="pt-4 border-t border-zinc-200 text-xs text-zinc-500 space-y-2">
              <p className="font-bold text-zinc-800">All prices in LKR</p>
              <p>Islandwide shipping available across Sri Lanka.</p>
            </div>

          </div>

          {/* Product Grid Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Results count bar */}
            <div className="flex items-center justify-between text-xs text-zinc-500 font-medium px-1">
              <span>Showing {filteredProducts.length} footwear styles</span>
              {selectedCategory !== 'all' && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold uppercase text-[10px]">
                  Category: {selectedCategory}
                </span>
              )}
            </div>

            <ProductGrid products={filteredProducts} />
          </div>

        </div>

      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
                Filter Products
              </h3>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                aria-label="Close filters"
                className="p-1 text-zinc-500 hover:text-zinc-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-zinc-400">Categories</h4>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.value);
                        setIsMobileFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider ${
                        selectedCategory === cat.value
                          ? 'bg-zinc-900 text-white'
                          : 'text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-800">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-zinc-900 border-zinc-300"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-zinc-200 flex gap-2">
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex-1 py-2.5 border border-zinc-300 rounded-xl text-xs font-bold uppercase text-zinc-700"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase"
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
