import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (qty: number) => void;
  maxStock?: number;
}

export function QuantitySelector({
  quantity,
  onQuantityChange,
  maxStock = 99,
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < maxStock) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] block">
        Quantity
      </label>

      <div className="inline-flex items-center bg-white dark:bg-[#1d1d1f] border border-black/[0.08] dark:border-white/[0.12] rounded-full p-1 soft-shadow">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] disabled:opacity-35 disabled:hover:bg-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <Minus className="w-4 h-4" />
        </button>

        <span className="w-12 text-center text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] select-none">
          {quantity}
        </span>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={quantity >= maxStock}
          aria-label="Increase quantity"
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] disabled:opacity-35 disabled:hover:bg-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

