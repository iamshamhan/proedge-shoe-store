import React from 'react';
import { Product } from '@/types/product';
import { ProductCard } from '@/components/ui/product-card';

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  emptyMessage = 'No footwear products found matching your criteria.',
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white border border-zinc-200 rounded-2xl">
        <p className="text-zinc-500 font-medium text-base">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 4} />
      ))}
    </div>
  );
}
