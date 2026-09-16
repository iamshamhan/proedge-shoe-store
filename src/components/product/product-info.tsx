'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/product';
import { formatLKR } from '@/data/products';
import { SizeSelector } from '@/components/product/size-selector';
import { ColorSelector } from '@/components/product/color-selector';
import { QuantitySelector } from '@/components/product/quantity-selector';
import { useCart } from '@/context/cart-context';
import { ShoppingBag, Star, ShieldCheck, Truck, Zap, MessageSquare } from 'lucide-react';
import { STORE_CONFIG } from '@/lib/config';

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors && product.colors.length > 0 ? product.colors[0] : 'Standard'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [validationError, setValidationError] = useState<boolean>(false);

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setValidationError(true);
      return;
    }
    setValidationError(false);

    const variantId = product.variants?.find(
      (v) => v.size === selectedSize && v.colour === selectedColor,
    )?.id;

    addItem({
      productId: product.id,
      variantId: variantId,


      name: product.name,
      slug: product.slug,
      image: product.images[0],
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      quantity: quantity,
    });
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setValidationError(true);
      return;
    }
    setValidationError(false);

    const variantId = product.variants?.find(
      (v) => v.size === selectedSize && v.colour === selectedColor,
    )?.id;

    addItem({
      productId: product.id,
      variantId: variantId,


      name: product.name,
      slug: product.slug,
      image: product.images[0],
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      quantity: quantity,
    });

    router.push('/checkout');
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Brand & Stock Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-amber-600">
            {product.brand} • {product.category}
          </span>

          {/* Stock Info */}
          {product.stock <= 0 ? (
            <span className="px-2.5 py-1 text-[11px] font-extrabold uppercase bg-rose-100 text-rose-800 rounded-md">
              Out of Stock
            </span>
          ) : product.stock <= 3 ? (
            <span className="px-2.5 py-1 text-[11px] font-extrabold uppercase bg-amber-100 text-amber-900 rounded-md">
              Only {product.stock} Left in Stock
            </span>
          ) : (
            <span className="px-2.5 py-1 text-[11px] font-extrabold uppercase bg-emerald-100 text-emerald-900 rounded-md">
              In Stock
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900">
          {product.name}
        </h1>

        {/* Rating Placeholder */}
        <div className="flex items-center gap-2 pt-1 text-xs text-zinc-500 font-semibold">
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
      <div className="p-4 bg-zinc-100/80 rounded-2xl border border-zinc-200 flex flex-wrap items-baseline gap-3">
        <span className="text-3xl font-black text-zinc-900">
          {formatLKR(product.price)}
        </span>
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <span className="text-base text-zinc-400 line-through font-medium">
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
      <p className="text-sm text-zinc-600 leading-relaxed">
        {product.description}
      </p>

      {/* Size Selector */}
      <SizeSelector
        sizes={product.sizes}
        selectedSize={selectedSize}
        onSelectSize={(s) => {
          setSelectedSize(s);
          setValidationError(false);
        }}
        hasError={validationError}
      />

      {/* Colour Selector */}
      <ColorSelector
        colors={product.colors}
        selectedColor={selectedColor}
        onSelectColor={setSelectedColor}
      />

      {/* Quantity Selector */}
      <QuantitySelector
        quantity={quantity}
        onQuantityChange={setQuantity}
        maxStock={product.stock}
      />

      {/* CTAs: Add to Cart & Buy Now */}
      <div className="pt-2 space-y-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className="w-full py-4 bg-zinc-900 text-white font-extrabold text-sm uppercase tracking-wider rounded-xl hover:bg-amber-600 hover:text-zinc-950 transition-all flex items-center justify-center gap-2 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 disabled:opacity-50"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Add To Cart</span>
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={product.stock <= 0}
          className="w-full py-4 bg-amber-500 text-zinc-950 font-black text-sm uppercase tracking-wider rounded-xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 disabled:opacity-50"
        >
          <Zap className="w-5 h-5" />
          <span>Buy Now</span>
        </button>
      </div>

      {/* Trust Badges */}
      <div className="pt-4 border-t border-zinc-200 grid grid-cols-2 gap-3 text-xs text-zinc-600 font-medium">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Islandwide Delivery</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
          <span>100% Quality Guaranteed</span>
        </div>
        <div className="flex items-center gap-2 col-span-2 pt-1">
          <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>WhatsApp support: {STORE_CONFIG.whatsappNumber}</span>
        </div>
      </div>
    </div>
  );
}
