'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Check, PackageX } from 'lucide-react';
import { Product } from '@/types/product';
import { formatLKR } from '@/data/products';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [isAdded, setIsAdded] = useState(false);

  const isOutOfStock = product.stock <= 0;

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;

    const defaultSize = product.sizes?.[0];
    const defaultColor = product.colors?.[0] ?? 'Standard';
    const defaultVariant = product.variants?.find(
      (v) =>
        (v.sizeValue === String(defaultSize) || String(v.size) === String(defaultSize)) &&
        v.colour === defaultColor,
    );

    addItem({
      productId: product.id,
      variantId: defaultVariant?.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      price: product.price,
      size: defaultSize,
      sizeSystem: product.sizeSystem,
      color: defaultColor,
      quantity: 1,
    });
    setIsAdded(true);
    window.setTimeout(() => setIsAdded(false), 1800);
  };

  const wishlisted = isWishlisted(product.id);

  return (
    <div className="group relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700">
      {/* Badges Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {discountPercent > 0 && (
          <span className="px-2.5 py-1 text-[11px] font-black tracking-wider uppercase bg-amber-500 text-zinc-950 rounded-md shadow-xs">
            -{discountPercent}% OFF
          </span>
        )}
        {product.newArrival && discountPercent === 0 && (
          <span className="px-2.5 py-1 text-[11px] font-black tracking-wider uppercase bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 rounded-md shadow-xs font-black">
            NEW
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
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 dark:bg-zinc-950/80 backdrop-blur-xs text-zinc-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-zinc-900 shadow-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-amber-500"
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            wishlisted ? 'fill-amber-500 text-amber-500' : 'text-zinc-600 dark:text-zinc-400'
          }`}
        />
      </button>

      {/* Image Wrapper */}
      <Link
        href={`/product/${product.slug}`}
        aria-label={`View ${product.name}`}
        className="relative aspect-square w-full bg-zinc-100 dark:bg-zinc-800/60 overflow-hidden block"
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={`object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out ${
            isOutOfStock ? 'opacity-50 saturate-50' : ''
          }`}
        />

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/50">
            <span className="px-3 py-1.5 flex items-center gap-1.5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-md">
              <PackageX className="w-4 h-4" />
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 font-semibold tracking-wider uppercase mb-1">
            <span>{product.brand}</span>
            <span className="capitalize">{product.category}</span>
          </div>

          {/* Product Name */}
          <Link
            href={`/product/${product.slug}`}
            className="font-bold text-base text-zinc-900 dark:text-white line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors block"
          >
            {product.name}
          </Link>

          {/* Size Quick Preview */}
          {!isOutOfStock && (
            <div className="mt-2.5 flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold tracking-wider uppercase mr-1">
                EU:
              </span>
              {product.sizes.map((size) => (
                <span
                  key={size}
                  className="px-1.5 py-0.5 text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xs shrink-0"
                >
                  {size}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
          <div>
            <span className="font-extrabold text-base sm:text-lg text-zinc-900 dark:text-white block">
              {formatLKR(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-zinc-400 dark:text-zinc-500 line-through block font-medium">
                {formatLKR(product.compareAtPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-amber-500 disabled:cursor-not-allowed ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : isOutOfStock
                  ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-600'
                  : 'bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-zinc-950'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}