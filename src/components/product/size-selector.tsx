'use client';

import React, { useState } from 'react';
import { Ruler, X, Check } from 'lucide-react';

interface SizeSelectorProps {
  sizes: (number | string)[];
  selectedSize: (number | string) | null;
  onSelectSize: (size: number | string) => void;
  sizeSystem?: string;
  hasError?: boolean;
  isOutOfStock?: (size: number | string) => boolean;
}

const FOOTWEAR_SIZE_CHART = [
  { eu: '38', uk: '5', usMen: '6', usWomen: '7.5', cm: '24.0' },
  { eu: '39', uk: '6', usMen: '6.5', usWomen: '8', cm: '24.5' },
  { eu: '40', uk: '6.5', usMen: '7', usWomen: '8.5', cm: '25.0' },
  { eu: '41', uk: '7.5', usMen: '8', usWomen: '9.5', cm: '26.0' },
  { eu: '42', uk: '8', usMen: '8.5', usWomen: '10', cm: '26.5' },
  { eu: '43', uk: '9', usMen: '9.5', usWomen: '11', cm: '27.5' },
  { eu: '44', uk: '9.5', usMen: '10', usWomen: '11.5', cm: '28.0' },
  { eu: '45', uk: '10.5', usMen: '11', usWomen: '12.5', cm: '29.0' },
  { eu: '46', uk: '11', usMen: '12', usWomen: '13.5', cm: '30.0' },
];

const APPAREL_SIZE_CHART = [
  { size: 'S', chest: '88 – 96 cm', waist: '73 – 81 cm', fit: 'Athletic Slim' },
  { size: 'M', chest: '96 – 104 cm', waist: '81 – 89 cm', fit: 'Standard Fit' },
  { size: 'L', chest: '104 – 112 cm', waist: '89 – 97 cm', fit: 'Standard Fit' },
  { size: 'XL', chest: '112 – 124 cm', waist: '97 – 109 cm', fit: 'Relaxed Fit' },
  { size: 'XXL', chest: '124 – 136 cm', waist: '109 – 121 cm', fit: 'Relaxed Fit' },
];

export function SizeSelector({
  sizes,
  selectedSize,
  onSelectSize,
  sizeSystem = 'EU',
  hasError = false,
  isOutOfStock,
}: SizeSelectorProps) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  if (!sizes || sizes.length === 0) return null;

  const isCustom = sizeSystem === 'Custom';
  const isApparel = sizeSystem === 'Apparel';
  const labelText = isCustom ? 'Select Option / Size' : `Select Size (${sizeSystem})`;

  // If there is only 1 size option and it's "One Size", render a subtle confirmation badge
  const isOnlyOneSize = sizes.length === 1 && (sizes[0] === 'One Size' || sizes[0] === 'Standard');

  return (
    <div className="space-y-2.5" data-testid="size-selector">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
          <span>{labelText}</span>
          {!isOnlyOneSize && <span className="text-rose-500">*</span>}
        </label>

        <div className="flex items-center gap-3">
          {selectedSize && (
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
              Selected: {isCustom ? '' : `${sizeSystem} `}{selectedSize}
            </span>
          )}
          {!isOnlyOneSize && (
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 underline underline-offset-4 transition-colors"
            >
              <Ruler className="w-3.5 h-3.5 text-amber-500" />
              <span>Size Guide</span>
            </button>
          )}
        </div>
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

      {/* Interactive Size Guide Modal */}
      {isGuideOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="size-guide-title"
        >
          <div
            className="fixed inset-0"
            onClick={() => setIsGuideOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-2xl max-h-[88vh] overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 block">
                  PROEDGE Fit Reference
                </span>
                <h2
                  id="size-guide-title"
                  className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mt-0.5"
                >
                  {isApparel ? 'Apparel Size Chart' : 'Footwear & Gear Size Guide'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsGuideOpen(false)}
                aria-label="Close size guide"
                className="p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isApparel && (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  International Footwear Conversion
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 uppercase font-black">
                      <tr>
                        <th className="py-3 px-3.5">EU</th>
                        <th className="py-3 px-3.5">UK</th>
                        <th className="py-3 px-3.5">US (Men)</th>
                        <th className="py-3 px-3.5">US (Women)</th>
                        <th className="py-3 px-3.5">Foot Length (CM)</th>
                        <th className="py-3 px-3.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {FOOTWEAR_SIZE_CHART.map((row) => {
                        const matchKey =
                          sizeSystem === 'UK'
                            ? row.uk
                            : sizeSystem === 'US'
                              ? row.usMen
                              : row.eu;
                        const existsInProduct = sizes.some((s) => String(s) === String(matchKey));
                        const soldOut =
                          existsInProduct && isOutOfStock ? isOutOfStock(matchKey) : false;
                        const isCurrent = String(selectedSize) === String(matchKey);

                        return (
                          <tr
                            key={row.eu}
                            className={`transition-colors ${
                              isCurrent
                                ? 'bg-amber-50 dark:bg-amber-950/30 font-bold'
                                : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                            }`}
                          >
                            <td className="py-2.5 px-3.5 font-black text-zinc-900 dark:text-white">
                              {row.eu}
                            </td>
                            <td className="py-2.5 px-3.5 text-zinc-700 dark:text-zinc-300">
                              {row.uk}
                            </td>
                            <td className="py-2.5 px-3.5 text-zinc-700 dark:text-zinc-300">
                              {row.usMen}
                            </td>
                            <td className="py-2.5 px-3.5 text-zinc-700 dark:text-zinc-300">
                              {row.usWomen}
                            </td>
                            <td className="py-2.5 px-3.5 font-semibold text-amber-600 dark:text-amber-400">
                              {row.cm} cm
                            </td>
                            <td className="py-2.5 px-3.5 text-right">
                              {existsInProduct && !soldOut ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const matchingSize =
                                      sizes.find((s) => String(s) === String(matchKey)) ?? matchKey;
                                    onSelectSize(matchingSize);
                                    setIsGuideOpen(false);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 text-[10px] font-black uppercase tracking-wider hover:bg-amber-500 dark:hover:bg-amber-400 transition-colors"
                                >
                                  {isCurrent && <Check className="w-3 h-3" />}
                                  <span>{isCurrent ? 'Selected' : 'Select'}</span>
                                </button>
                              ) : existsInProduct && soldOut ? (
                                <span className="text-[10px] font-bold uppercase text-rose-500">
                                  Sold Out
                                </span>
                              ) : (
                                <span className="text-[10px] text-zinc-400">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Apparel &amp; Jersey Reference
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 uppercase font-black">
                    <tr>
                      <th className="py-2.5 px-3.5">Size</th>
                      <th className="py-2.5 px-3.5">Chest</th>
                      <th className="py-2.5 px-3.5">Waist</th>
                      <th className="py-2.5 px-3.5">Cut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {APPAREL_SIZE_CHART.map((row) => (
                      <tr key={row.size}>
                        <td className="py-2 px-3.5 font-black text-zinc-900 dark:text-white">
                          {row.size}
                        </td>
                        <td className="py-2 px-3.5 text-zinc-700 dark:text-zinc-300">{row.chest}</td>
                        <td className="py-2 px-3.5 text-zinc-700 dark:text-zinc-300">{row.waist}</td>
                        <td className="py-2 px-3.5 text-zinc-500 dark:text-zinc-400">{row.fit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* How to Measure Guide */}
            <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 p-4 space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
              <p className="font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                Pro Fit Tip — How to Measure Your Foot
              </p>
              <ol className="list-decimal list-inside space-y-1 leading-relaxed">
                <li>Place a sheet of paper on a hard floor flush against a wall.</li>
                <li>Stand with your heel gently touching the wall and mark the tip of your longest toe.</li>
                <li>
                  Measure the distance in <strong>cm</strong>. If you are between two sizes or wear thick
                  match socks (Football / Rugby / Basketball), we recommend sizing up by <strong>0.5 – 1 EU size</strong>.
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


