'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/product';
import { resolveProductVariant } from '@/lib/product-variants';
import { formatLKR } from '@/lib/currency';
import { SizeSelector } from '@/components/product/size-selector';
import { ColorSelector } from '@/components/product/color-selector';
import { QuantitySelector } from '@/components/product/quantity-selector';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';
import { useStoreSettings } from '@/context/settings-context';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  Zap,
  MessageSquare,
  Check,
  Heart,
  Share2,
} from 'lucide-react';
import { formatWhatsAppChatUrl } from '@/lib/whatsapp';

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const router = useRouter();
  const { addItem, setIsCartDrawerOpen } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { whatsappNumber } = useStoreSettings();
  const [linkCopied, setLinkCopied] = useState(false);

  const wishlisted = isWishlisted(product.id);

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

  const availableSystems = [...new Set(variants.map(v => v.sizeSystem ?? product.sizeSystem ?? 'Custom'))];
  const [selectedSystem, setSelectedSystem] = useState(product.sizeSystem ?? availableSystems[0] ?? 'Custom');

  // Derive available sizes from variants list (or fallback to product.sizes)
  const availableSizes = useMemo(() => {
    if (variants.length > 0) {
      const unique = [
        ...new Set(
          variants
            .filter(v => (v.sizeSystem ?? product.sizeSystem ?? 'Custom') === selectedSystem)
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
  }, [variants, product.sizes, product.sizeSystem, selectedSystem]);

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

    return resolveProductVariant(variants, selectedColor, selectedSystem, targetSize, product.sizeSystem);
  }, [variants, selectedColor, selectedSize, availableSizes, selectedSystem, product.sizeSystem]);

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
    const v = resolveProductVariant(variants, selectedColor, selectedSystem, sStr, product.sizeSystem);
    return !v || v.stock <= 0;
  };

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  const requiresSizeSelection = availableSizes.length > 0;

  const handleAddToCart = () => {
    if (requiresSizeSelection && !selectedSize) {
      setValidationError(true);
      const sizeEl = document.querySelector('[data-testid="size-selector"]');
      sizeEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setValidationError(false);

    if (currentStock <= 0 || (variants.length > 0 && !resolvedVariant)) return;

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
      maxStock: currentStock,
    });

    setIsAdded(true);
    setIsCartDrawerOpen(true);
    window.setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (requiresSizeSelection && !selectedSize) {
      setValidationError(true);
      const sizeEl = document.querySelector('[data-testid="size-selector"]');
      sizeEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setValidationError(false);

    if (currentStock <= 0 || (variants.length > 0 && !resolvedVariant)) return;

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
      maxStock: currentStock,
    });

    router.push('/checkout');
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url: shareUrl });
        return;
      } catch {
        // Fallback to clipboard copy
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 pb-20 lg:pb-0">
      {/* Brand & Stock Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            {product.brand} • {product.categoryName || product.category}
          </span>

          {/* Stock Badge */}
          {currentStock <= 0 ? (
            <span className="px-3 py-1 text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full">
              Out of Stock
            </span>
          ) : currentStock <= 3 ? (
            <span className="px-3 py-1 text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 rounded-full">
              Only {currentStock} Left
            </span>
          ) : (
            <span className="px-3 py-1 text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 rounded-full">
              In Stock
            </span>
          )}
        </div>

        <div className="flex items-start justify-between gap-3">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.025em] text-[#1d1d1f] dark:text-[#f5f5f7]">
            {product.name}
          </h1>

          {/* Quick Wishlist & Share Actions */}
          <div className="flex items-center gap-2 shrink-0 pt-1">
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-pressed={wishlisted}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              className={`p-2.5 rounded-full border transition-all ${
                wishlisted
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-400 text-amber-500'
                  : 'bg-white dark:bg-[#1d1d1f] border-black/[0.08] dark:border-white/[0.12] text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share product"
              title={linkCopied ? 'Link copied!' : 'Share product'}
              className="p-2.5 rounded-full bg-white dark:bg-[#1d1d1f] border border-black/[0.08] dark:border-white/[0.12] text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition-all relative"
            >
              {linkCopied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Display */}
      <div className="p-5 bg-white dark:bg-[#1d1d1f] rounded-[28px] border border-black/[0.05] dark:border-white/[0.08] flex flex-wrap items-baseline gap-3 soft-shadow">
        <span className="text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
          {formatLKR(product.price)}
        </span>
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <span className="text-base text-[#86868b] line-through font-normal">
            {formatLKR(product.compareAtPrice)}
          </span>
        )}
        {discountPercent > 0 && (
          <span className="px-3 py-0.5 text-xs font-semibold bg-amber-500 text-zinc-950 rounded-full">
            Save {discountPercent}%
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-[15px] text-[#6e6e73] dark:text-[#86868b] leading-relaxed">
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

      {availableSystems.length > 1 && (
        <div className="space-y-2">
          <label htmlFor="size-system" className="text-sm font-semibold">Size system</label>
          <select id="size-system" value={selectedSystem}
            className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-zinc-900 dark:bg-zinc-900 dark:text-white"
            onChange={event => {
              setSelectedSystem(event.target.value as typeof selectedSystem);
              setSelectedSize(null);
              setValidationError(false);
            }}>
            {availableSystems.map(system => <option key={system} value={system}>{system}</option>)}
          </select>
        </div>
      )}
      {/* Size Selector */}
      {availableSizes.length > 0 && (
        <SizeSelector
          sizes={availableSizes}
          selectedSize={selectedSize}
          sizeSystem={selectedSystem}
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
          className={`w-full py-4 font-semibold text-[15px] tracking-tight rounded-full transition-all flex items-center justify-center gap-2 soft-shadow focus:outline-none focus-visible:ring-2 disabled:opacity-50 min-h-[48px] ${
            isAdded
              ? 'bg-emerald-600 text-white'
              : 'bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] hover:bg-amber-500 dark:hover:bg-amber-400 hover:text-zinc-950 focus-visible:ring-zinc-900 dark:focus-visible:ring-amber-500'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-5 h-5 text-white" />
              <span>Added to Bag</span>
            </>
          ) : currentStock <= 0 ? (
            <span>Sold Out</span>
          ) : (
            <>
              <ShoppingBag className="w-5 h-5" />
              <span>Add to Bag</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={currentStock <= 0}
          className="w-full py-4 bg-amber-500 text-zinc-950 font-semibold text-[15px] tracking-tight rounded-full hover:bg-amber-400 transition-all flex items-center justify-center gap-2 soft-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 disabled:opacity-50 min-h-[48px]"
        >
          <Zap className="w-5 h-5" />
          <span>{currentStock <= 0 ? 'Out of Stock' : 'Buy Now'}</span>
        </button>
      </div>

      {/* Trust Badges */}
      <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08] grid grid-cols-2 gap-3 text-xs text-[#6e6e73] dark:text-[#86868b] font-medium">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Islandwide Delivery</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
          <span>7-Day Returns (T&amp;C apply)</span>
        </div>
        {whatsappNumber && <a
          href={formatWhatsAppChatUrl(
            whatsappNumber,
            `Hello PROEDGE team! I have a question about ${product.name} (Rs. ${product.price.toLocaleString()}). Could you assist me?`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 col-span-2 pt-1 text-xs text-[#6e6e73] dark:text-[#86868b] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
          <span>
            WhatsApp support: <span className="font-semibold underline decoration-emerald-500/40 group-hover:decoration-emerald-500">{whatsappNumber}</span>
          </span>
        </a>}
      </div>

      {/* Sticky Mobile Bottom Add-to-Bag Bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-white/90 dark:bg-[#1d1d1f]/90 apple-glass border-t border-black/[0.06] dark:border-white/[0.08] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-3 shadow-2xl">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#6e6e73] dark:text-[#86868b] truncate">
            {selectedSize
              ? `${selectedSystem !== 'Custom' ? `${selectedSystem} ` : ''}${selectedSize} • ${selectedColor}`
              : 'Select size above'}
          </p>
          <p className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            {formatLKR(product.price * effectiveQuantity)}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={currentStock <= 0}
          className={`px-6 py-3 rounded-full font-semibold text-sm tracking-tight flex items-center justify-center gap-2 shrink-0 transition-all shadow-md min-h-[44px] disabled:opacity-50 ${
            isAdded
              ? 'bg-emerald-600 text-white'
              : 'bg-[#1d1d1f] dark:bg-amber-500 text-white dark:text-zinc-950'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4" />
              <span>Added</span>
            </>
          ) : currentStock <= 0 ? (
            <span>Sold Out</span>
          ) : requiresSizeSelection && !selectedSize ? (
            <span>Select Size</span>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Bag</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
