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
      <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 block">
        Quantity
      </label>

      <div className="inline-flex items-center bg-white border-2 border-zinc-200 rounded-xl p-1 shadow-xs">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
        >
          <Minus className="w-4 h-4" />
        </button>

        <span className="w-12 text-center text-sm font-black text-zinc-900 select-none">
          {quantity}
        </span>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={quantity >= maxStock}
          aria-label="Increase quantity"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
