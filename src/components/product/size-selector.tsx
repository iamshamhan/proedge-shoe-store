import React from 'react';

interface SizeSelectorProps {
  sizes: number[];
  selectedSize: number | null;
  onSelectSize: (size: number) => void;
  hasError?: boolean;
}

export function SizeSelector({
  sizes,
  selectedSize,
  onSelectSize,
  hasError = false,
}: SizeSelectorProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
          <span>Select Size (EU)</span>
          <span className="text-rose-500">*</span>
        </label>
        {selectedSize && (
          <span className="text-xs text-amber-600 font-bold uppercase tracking-wider">
            Selected: EU {selectedSize}
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {sizes.map((size) => {
          const isSelected = selectedSize === size;
          return (
            <button
              key={size}
              type="button"
              onClick={() => onSelectSize(size)}
              className={`py-3 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
                isSelected
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-md ring-2 ring-amber-500/50'
                  : 'bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50'
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>

      {hasError && !selectedSize && (
        <p role="alert" className="text-xs font-bold text-rose-600 pt-1">
          Please select a shoe size before adding to cart.
        </p>
      )}
    </div>
  );
}
