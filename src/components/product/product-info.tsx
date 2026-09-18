'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/product';
import { formatLKR } from '@/data/products';
import { SizeSelector } from '@/components/product/size-selector';
import { ColorSelector } from '@/components/product/color-selector';
import { QuantitySelector } from '@/components/product/quantity-selector';
import { useCart } from '@/context/cart-context';
import { ShoppingBag, Star, ShieldCheck, Truck, Zap, MessageSquare, Check } from 'lucide-react';
import { STORE_CONFIG } from '@/lib/config';

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const router = useRouter();
  const { addItem } = useCart();

  // Authoritative variants from product
  const variants = useMemo(() => product.variants ?? [], [product.variants]);

  // Derive available colours from variants list (or fallback to product.colors)
  const availableColors = useMemo(() => {
    if (variants.length > 0) {
      const unique = [...new Set(variants.map((v) => v.colour).filter(Boolean))];
      if (unique.length > 0) return unique;
    }
    return product.colors && product.colors.length > 0 ? product.colors : ['Standard'];
  }, [variants, product.colors]);

  // Derive available sizes from variants list (or fallback to product.sizes)
  const availableSizes = useMemo(() => {
    if (variants.length > 0) {
      const unique = [
        ...new Set(
          variants
            .map((v) => (v.sizeValue ? String(v.sizeValue) : v.size ? String(v.size) : ''))
            .filter(Boolean),
        ),
      ];
      if (unique.length > 0) {
        return unique.sort((a, b) => {
          const numA = Number(a);
          const numB = Number(b);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return a.localeCompare(b);
        });
      }
    }
    return (product.sizes ?? []).map(String);
  }, [variants, product.sizes]);

  // Initial state: Auto-select if there is exactly one size (e.g. "One Size" or "Size 5")
  const autoSelectSize = availableSizes.length === 1 ? availableSizes[0] : null;

  const [selectedColor, setSelectedColor] = useState<string>(
    availableColors.length > 0 ? availableColors[0] : 'Standard',
  );
  const [selectedSize, setSelectedSize] = useState<number | string | null>(autoSelectSize);
  const [quantity, setQuantity] = useState<number>(1);
  const [validationError, setValidationError] = useState<boolean>(false);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  // Exact Variant Resolution: colour + sizeSystem + sizeValue
  const resolvedVariant = useMemo(() => {
    if (!selectedSize && availableSizes.length > 0) return null;
    const targetSize = String(selectedSize || (availableSizes.length === 0 ? 'One Size' : ''));

    // Look for exact match (colour + sizeValue + sizeSystem)
    let match = variants.find(
      (v) =>
        v.colour === selectedColor &&
        (v.sizeValue === targetSize || String(v.size) === targetSize) &&
        (!product.sizeSystem || v.sizeSystem === product.sizeSystem),
    );

    // Fallback without sizeSystem restriction
    if (!match) {
      match = variants.find(
        (v) =>
          v.colour === selectedColor &&
          (v.sizeValue === targetSize || String(v.size) === targetSize),
      );
    }

    // Fallback if product has only 1 variant
    if (!match && variants.length === 1) {
      match = variants[0];
    }

    return match ?? null;
  }, [variants, selectedColor, selectedSize, availableSizes, product.sizeSystem]);

  // Exact stock determination based on selected variant
  const currentStock = useMemo(() => {
    if (resolvedVariant) {
      return resolvedVariant.stock;
    }
    // If a size was chosen but no matching variant was found, stock is 0
    if (selectedSize && variants.length > 0) {
      return 0;
    }
    // If no size chosen yet, show product total stock
    return product.stock;
  }, [resolvedVariant, selectedSize, variants.length, product.stock]);

  // Derive safe quantity constrained by variant stock
  const effectiveQuantity = currentStock > 0 ? Math.min(quantity, currentStock) : 1;

  // Helper to check if a specific size is out of stock for the currently selected color
  const checkSizeOutOfStock = (sizeVal: number | string) => {
    if (variants.length === 0) return false;
    const sStr = String(sizeVal);
    const v = variants.find(
      (item) =>
        item.colour === selectedColor &&
        (item.sizeValue === sStr || String(item.size) === sStr),
    );
    return v ? v.stock <= 0 : false;
  };

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  const requiresSizeSelection = availableSizes.length > 1;

  const handleAddToCart = () => {
    if (requiresSizeSelection && !selectedSize) {
      setValidationError(true);
      return;
    }
    setValidationError(false);

    if (currentStock <= 0) return;

    const finalSize = selectedSize || (availableSizes.length > 0 ? availableSizes[0] : 'One Size');
    const finalSizeSystem = resolvedVariant?.sizeSystem || product.sizeSystem || 'Custom';

    addItem({
      productId: product.id,
      variantId: resolvedVariant?.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      price: product.price,
      size: finalSize,
      sizeSystem: finalSizeSystem,
      color: selectedColor,
      quantity: effectiveQuantity,
    });

    setIsAdded(true);
    window.setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (requiresSizeSelection && !selectedSize) {
      setValidationError(true);
      return;
    }
    setValidationError(false);

    if (currentStock <= 0) return;

    const finalSize = selectedSize || (availableSizes.length > 0 ? availableSizes[0] : 'One Size');
    const finalSizeSystem = resolvedVariant?.sizeSystem || product.sizeSystem || 'Custom';

    addItem({
      productId: product.id,
      variantId: resolvedVariant?.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      price: product.price,
      size: finalSize,
      sizeSystem: finalSizeSystem,
      color: selectedColor,
      quantity: effectiveQuantity,
    });

    router.push('/checkout');
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Brand & Stock Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-amber-600">
            {product.brand} • {product.categoryName || product.category}
          </span>

          {/* Stock Badge */}
          {currentStock <= 0 ? (
            <span className="px-2.5 py-1 text-[11px] font-extrabold uppercase bg-rose-100 text-rose-800 rounded-md">
              Out of Stock
            </span>
          ) : currentStock <= 3 ? (
            <span className="px-2.5 py-1 text-[11px] font-extrabold uppercase bg-amber-100 text-amber-900 rounded-md">
              Only {currentStock} Left in Stock
            </span>
          ) : (
            <span className="px-2.5 py-1 text-[11px] font-extrabold uppercase bg-emerald-100 text-emerald-900 rounded-md">
              In Stock ({currentStock} available)
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
          {product.name}
        </h1>

        {/* Rating Placeholder */}
        <div className="flex items-center gap-2 pt-1 text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
          <div className="flex items-center text-amber-500">
            <Star className="w-4 h-4 fill-amber-500" />
            <Star className="w-4 h-4 fill-amber-500" />
            <Star className="w-4 h-4 fill-amber-500" />
            <Star className="w-4 h-4 fill-amber-500" />
            <Star className="w-4 h-4 fill-amber-500" />
          </div>
          <span>4.9 / 5.0 (Authentic PROEDGE Performance)</span>
        </div>
      </div>

      {/* Pricing Display */}
      <div className="p-4 bg-zinc-100/80 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-baseline gap-3">
        <span className="text-3xl font-black text-zinc-900 dark:text-white">
          {formatLKR(product.price)}
        </span>
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <span className="text-base text-zinc-400 dark:text-zinc-500 line-through font-medium">
            {formatLKR(product.compareAtPrice)}
          </span>
        )}
        {discountPercent > 0 && (
          <span className="px-2.5 py-0.5 text-xs font-black uppercase bg-amber-500 text-zinc-950 rounded-md">
            Save {discountPercent}%
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
        {product.description}
      </p>

      {/* Colour Selector */}
      {availableColors.length > 1 && (
        <ColorSelector
          colors={availableColors}
          selectedColor={selectedColor}
          onSelectColor={(newColor) => {
            setSelectedColor(newColor);
            setValidationError(false);
            if (variants.length > 0 && selectedSize) {
              const sStr = String(selectedSize);
              const existsInNewColor = variants.some(
                (v) =>
                  v.colour === newColor &&
                  (v.sizeValue === sStr || String(v.size) === sStr) &&
                  v.stock > 0,
              );
              if (!existsInNewColor) {
                const firstAvailable = variants.find((v) => v.colour === newColor && v.stock > 0);
                if (firstAvailable) {
                  setSelectedSize(firstAvailable.sizeValue || firstAvailable.size);
                }
              }
            }
          }}
        />
      )}

      {/* Size Selector */}
      {availableSizes.length > 0 && (
        <SizeSelector
          sizes={availableSizes}
          selectedSize={selectedSize}
          sizeSystem={resolvedVariant?.sizeSystem || product.sizeSystem}
          onSelectSize={(s) => {
            setSelectedSize(s);
            setValidationError(false);
          }}
          hasError={validationError}
          isOutOfStock={checkSizeOutOfStock}
        />
      )}

      {/* Quantity Selector */}
      <QuantitySelector
        quantity={effectiveQuantity}
        onQuantityChange={(q) => setQuantity(Math.min(q, Math.max(1, currentStock)))}
        maxStock={Math.max(1, currentStock)}
      />

      {/* CTAs: Add to Cart & Buy Now */}
      <div className="pt-2 space-y-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={currentStock <= 0}
          className={`w-full py-4 font-extrabold text-sm uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg focus:outline-none focus-visible:ring-2 disabled:opacity-50 ${
            isAdded
              ? 'bg-emerald-600 text-white'
              : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-zinc-950 focus-visible:ring-zinc-900 dark:focus-visible:ring-amber-500'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-5 h-5 text-white" />
              <span>Added To Cart!</span>
            </>
          ) : currentStock <= 0 ? (
            <span>Sold Out</span>
          ) : (
            <>
              <ShoppingBag className="w-5 h-5" />
              <span>Add To Cart</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={currentStock <= 0}
          className="w-full py-4 bg-amber-500 text-zinc-950 font-black text-sm uppercase tracking-wider rounded-xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 disabled:opacity-50"
        >
          <Zap className="w-5 h-5" />
          <span>{currentStock <= 0 ? 'Out of Stock' : 'Buy Now'}</span>
        </button>
      </div>

      {/* Trust Badges */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-2 gap-3 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Islandwide Delivery</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
          <span>100% Quality Guaranteed</span>
        </div>
        <div className="flex items-center gap-2 col-span-2 pt-1">
          <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>WhatsApp support: {STORE_CONFIG.whatsappNumber}</span>
        </div>
      </div>
    </div>
  );
}
