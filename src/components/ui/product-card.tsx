'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Check, PackageX } from 'lucide-react';
import { resolveProductVariant } from '@/lib/product-variants';
import { Product } from '@/types/product';
import { formatLKR } from '@/data/products';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem, setIsCartDrawerOpen } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [isAdded, setIsAdded] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const variants = product.variants ?? [];
  const [selectedVariantId, setSelectedVariantId] = useState(variants.find(v => v.stock > 0)?.id ?? '');
  const selected = variants.find(v => v.id === selectedVariantId);
  const targetVariant = selected ? resolveProductVariant(variants, selected.colour,
    selected.sizeSystem ?? product.sizeSystem ?? 'Custom', String(selected.sizeValue || selected.size), product.sizeSystem) : null;

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;

    if (!targetVariant || targetVariant.stock <= 0) return;
    addItem({
      productId: product.id,
      variantId: targetVariant?.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      price: product.price,
      size: targetVariant.sizeValue || targetVariant.size,
      sizeSystem: targetVariant.sizeSystem ?? product.sizeSystem ?? 'Custom',
      color: targetVariant.colour,
      quantity: 1,
      maxStock: targetVariant.stock,
    });
    setIsAdded(true);
    setIsCartDrawerOpen(true);
    window.setTimeout(() => setIsAdded(false), 1800);
  };

  const wishlisted = isWishlisted(product.id);
  const secondaryImage = product.images && product.images.length > 1 ? product.images[1] : null;

  return (
    <div className="group cursor-pointer relative bg-white dark:bg-[#1d1d1f] rounded-2xl sm:rounded-[28px] border border-black/[0.05] dark:border-white/[0.08] overflow-hidden flex flex-col transition-all duration-500 soft-shadow hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.75)] hover:-translate-y-1">
      {/* Badges Overlay (Apple Pill Badges) */}
      <div className="absolute top-2 left-2 sm:top-3.5 sm:left-3.5 z-20 flex flex-col gap-1 sm:gap-1.5 items-start pointer-events-none">
        {discountPercent > 0 && (
          <span className="px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] font-semibold tracking-tight bg-amber-500 text-zinc-950 rounded-full shadow-xs">
            Save {discountPercent}%
          </span>
        )}
        {product.newArrival && discountPercent === 0 && (
          <span className="px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] font-semibold tracking-tight bg-[#1d1d1f]/90 dark:bg-white/90 apple-glass text-white dark:text-[#1d1d1f] rounded-full shadow-xs">
            New
          </span>
        )}
        {!isOutOfStock && product.stock <= 5 && (
          <span className="px-2 py-0.5 sm:px-2.5 text-[9px] sm:text-[10px] font-semibold tracking-tight bg-rose-600/90 apple-glass text-white rounded-full shadow-xs">
            Only {product.stock} left
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product.id);
        }}
        aria-pressed={wishlisted}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 p-2 sm:p-2.5 min-h-[36px] min-w-[36px] sm:min-h-[42px] sm:min-w-[42px] flex items-center justify-center cursor-pointer rounded-full bg-white/85 dark:bg-black/60 apple-glass text-zinc-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-zinc-900 shadow-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
      >
        <Heart
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
            wishlisted ? 'fill-amber-500 text-amber-500' : 'text-zinc-600 dark:text-zinc-300'
          }`}
        />
      </button>

      {/* Image Wrapper */}
      <Link
        href={`/product/${product.slug}`}
        aria-label={`View ${product.name}`}
        className="relative aspect-square w-full bg-[#f5f5f7] dark:bg-zinc-900/70 overflow-hidden block after:absolute after:inset-0 after:z-10"
        style={{ position: 'relative' }}
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={`object-cover object-center motion-safe:group-hover:scale-105 transition-all duration-700 ease-out ${
            secondaryImage ? 'group-hover:opacity-0' : ''
          } ${isOutOfStock ? 'opacity-50 saturate-50' : ''}`}
        />
        {secondaryImage && (
          <Image
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={`object-cover object-center opacity-0 group-hover:opacity-100 motion-safe:group-hover:scale-105 transition-all duration-700 ease-out ${
              isOutOfStock ? 'saturate-50' : ''
            }`}
          />
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45 apple-glass z-10">
            <span className="px-3.5 py-1.5 flex items-center gap-1.5 bg-white/95 dark:bg-[#1d1d1f] text-[#1d1d1f] dark:text-white text-xs font-semibold tracking-tight rounded-full shadow-md">
              <PackageX className="w-3.5 h-3.5" />
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Product Content Details */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3.5">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-[#6e6e73] dark:text-[#86868b] font-medium tracking-tight mb-0.5 sm:mb-1">
            <span className="truncate max-w-[65px] sm:max-w-none">{product.brand}</span>
            <span className="capitalize truncate max-w-[70px] sm:max-w-[140px] text-right">
              {product.categoryName || product.category.replace(/-/g, ' ')}
            </span>
          </div>

          {/* Product Name */}
          <Link
            href={`/product/${product.slug}`}
            className="font-semibold text-xs sm:text-base text-[#1d1d1f] dark:text-white tracking-tight line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors block"
          >
            {product.name}
          </Link>

          {/* Interactive Size Quick-Select Strip (Pill Selector) */}
          {!isOutOfStock && variants.length > 0 && (
            <div className="mt-1.5 sm:mt-3 flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5 no-scrollbar relative z-20">
              <span className="text-[10px] sm:text-[11px] text-[#6e6e73] dark:text-[#86868b] font-medium mr-0.5 shrink-0 hidden xs:inline-block">
                Variant:
              </span>
              {variants.map((variant) => {
                const size = [variant.sizeSystem ?? product.sizeSystem ?? 'Custom', variant.sizeValue || variant.size, variant.colour].join(' ');
                const available = variant.stock > 0;
                const isSelected = selectedVariantId === variant.id;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={!available}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (available) setSelectedVariantId(variant.id);
                    }}
                    title={available ? `Select size ${size}` : `Size ${size} out of stock`}
                    className={`px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[10px] sm:text-[11px] font-medium rounded-full shrink-0 transition-all ${
                      !available
                        ? 'bg-black/[0.03] dark:bg-white/[0.04] text-zinc-300 dark:text-zinc-600 line-through cursor-not-allowed'
                        : isSelected
                          ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] font-semibold'
                          : 'bg-[#f5f5f7] dark:bg-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.08] dark:hover:bg-white/[0.14]'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Pricing & Apple Pill Add Button */}
        <div className="pt-2 sm:pt-3 border-t border-black/[0.05] dark:border-white/[0.07] flex items-center justify-between gap-1.5 sm:gap-2 relative z-20">
          <div className="min-w-0">
            <span className="font-semibold text-xs sm:text-[17px] tracking-tight text-[#1d1d1f] dark:text-white block truncate">
              {formatLKR(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-[10px] sm:text-xs text-[#6e6e73] dark:text-[#86868b] line-through block font-normal truncate">
                {formatLKR(product.compareAtPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || !targetVariant || targetVariant.stock <= 0}
            className={`px-2.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-semibold tracking-tight rounded-full transition-all flex items-center gap-1 sm:gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:cursor-not-allowed shrink-0 min-h-[30px] sm:min-h-0 ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : isOutOfStock
                  ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600'
                  : 'bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] hover:bg-amber-500 hover:text-zinc-950 dark:hover:bg-amber-400 dark:hover:text-zinc-950'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Buy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}



