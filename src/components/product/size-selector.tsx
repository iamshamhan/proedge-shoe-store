import React from 'react';

interface SizeSelectorProps {
  sizes: (number | string)[];
  selectedSize: (number | string) | null;
  onSelectSize: (size: number | string) => void;
  sizeSystem?: string;
  hasError?: boolean;
  isOutOfStock?: (size: number | string) => boolean;
}

export function SizeSelector({
  sizes,
  selectedSize,
  onSelectSize,
  sizeSystem = 'EU',
  hasError = false,
  isOutOfStock,
}: SizeSelectorProps) {
  if (!sizes || sizes.length === 0) return null;

  const isCustom = sizeSystem === 'Custom';
  const labelText = isCustom ? 'Select Option / Size' : `Select Size (${sizeSystem})`;

  // If there is only 1 size option and it's "One Size", render a subtle confirmation badge
  const isOnlyOneSize = sizes.length === 1 && (sizes[0] === 'One Size' || sizes[0] === 'Standard');

  return (
    <div className="space-y-2.5" data-testid="size-selector">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
          <span>{labelText}</span>
          {!isOnlyOneSize && <span className="text-rose-500">*</span>}
        </label>
        {selectedSize && (
          <span className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
            Selected: {isCustom ? '' : `${sizeSystem} `}{selectedSize}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {sizes.map((size) => {
          const isSelected = String(selectedSize) === String(size);
          const soldOut = isOutOfStock ? isOutOfStock(size) : false;

          return (
            <button
              key={String(size)}
              type="button"
              disabled={soldOut}
              onClick={() => onSelectSize(size)}
              title={soldOut ? `${size} is out of stock` : undefined}
              className={`py-3 min-h-[44px] text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                soldOut
                  ? 'opacity-40 border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/40 text-zinc-400 line-through cursor-not-allowed'
                  : isSelected
                  ? 'bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 border-zinc-900 dark:border-amber-500 shadow-md ring-2 ring-amber-500/50'
                  : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/80'
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>

      {hasError && !selectedSize && !isOnlyOneSize && (
        <p role="alert" className="text-xs font-bold text-rose-600 pt-1">
          Please select a size or option before adding to cart.
        </p>
      )}
    </div>
  );
}


