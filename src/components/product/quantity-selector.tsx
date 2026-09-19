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
      <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white block">
        Quantity
      </label>

      <div className="inline-flex items-center bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-full p-1 shadow-sm">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
          className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <Minus className="w-4 h-4" />
        </button>

        <span className="w-12 text-center text-sm font-black text-zinc-900 dark:text-white select-none">
          {quantity}
        </span>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={quantity >= maxStock}
          aria-label="Increase quantity"
          className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

