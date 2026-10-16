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
    <div className="space-y-3" data-testid="size-selector">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-1">
          <span>{labelText}</span>
          {!isOnlyOneSize && <span className="text-rose-500">*</span>}
        </label>

        <div className="flex items-center gap-3">
          {selectedSize && (
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
              Selected: {isCustom ? '' : `${sizeSystem} `}{selectedSize}
            </span>
          )}
          {!isOnlyOneSize && (
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] transition-colors"
            >
              <Ruler className="w-3.5 h-3.5 text-amber-500" />
              <span>Size Guide</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
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
              className={`py-3 min-h-[44px] text-xs sm:text-sm font-semibold tracking-tight rounded-2xl border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                soldOut
                  ? 'opacity-40 border-black/[0.05] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.03] text-[#86868b] line-through cursor-not-allowed'
                  : isSelected
                  ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] border-[#1d1d1f] dark:border-white shadow-sm ring-2 ring-amber-500/40'
                  : 'bg-white dark:bg-[#1d1d1f] text-[#1d1d1f] dark:text-[#f5f5f7] border-black/[0.08] dark:border-white/[0.12] hover:border-black/25 dark:hover:border-white/30'
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>

      {hasError && !selectedSize && !isOnlyOneSize && (
        <p role="alert" className="text-xs font-medium text-rose-600 pt-1">
          Please select a size or option before adding to bag.
        </p>
      )}

      {/* Interactive Size Guide Modal */}
      {isGuideOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="size-guide-title"
        >
          <div
            className="fixed inset-0"
            onClick={() => setIsGuideOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-2xl max-h-[88vh] overflow-y-auto bg-white/95 dark:bg-[#1d1d1f]/95 apple-glass border border-black/[0.08] dark:border-white/[0.12] rounded-[32px] shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
              <div>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 block">
                  PROEDGE Fit Reference
                </span>
                <h2
                  id="size-guide-title"
                  className="text-xl sm:text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.02em] mt-0.5"
                >
                  {isApparel ? 'Apparel Size Chart' : 'Footwear & Gear Size Guide'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsGuideOpen(false)}
                aria-label="Close size guide"
                className="p-2 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-[#6e6e73] hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isApparel && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-[#6e6e73] dark:text-[#86868b]">
                  International Footwear Conversion
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f5f5f7] dark:bg-white/[0.05] text-[#6e6e73] dark:text-[#86868b] font-semibold">
                      <tr>
                        <th className="py-3 px-3.5">EU</th>
                        <th className="py-3 px-3.5">UK</th>
                        <th className="py-3 px-3.5">US (Men)</th>
                        <th className="py-3 px-3.5">US (Women)</th>
                        <th className="py-3 px-3.5">Foot Length (CM)</th>
                        <th className="py-3 px-3.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
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
                                ? 'bg-amber-50/70 dark:bg-amber-950/30 font-semibold'
                                : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.03]'
                            }`}
                          >
                            <td className="py-2.5 px-3.5 font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                              {row.eu}
                            </td>
                            <td className="py-2.5 px-3.5 text-[#6e6e73] dark:text-[#86868b]">
                              {row.uk}
                            </td>
                            <td className="py-2.5 px-3.5 text-[#6e6e73] dark:text-[#86868b]">
                              {row.usMen}
                            </td>
                            <td className="py-2.5 px-3.5 text-[#6e6e73] dark:text-[#86868b]">
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
                                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] text-[11px] font-semibold hover:bg-amber-500 hover:text-zinc-950 dark:hover:bg-amber-400 transition-colors"
                                >
                                  {isCurrent && <Check className="w-3 h-3" />}
                                  <span>{isCurrent ? 'Selected' : 'Select'}</span>
                                </button>
                              ) : existsInProduct && soldOut ? (
                                <span className="text-[11px] font-medium text-rose-500">
                                  Sold Out
                                </span>
                              ) : (
                                <span className="text-[11px] text-[#86868b]">—</span>
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
              <h3 className="text-xs font-semibold text-[#6e6e73] dark:text-[#86868b]">
                Apparel &amp; Jersey Reference
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f5f5f7] dark:bg-white/[0.05] text-[#6e6e73] dark:text-[#86868b] font-semibold">
                    <tr>
                      <th className="py-2.5 px-3.5">Size</th>
                      <th className="py-2.5 px-3.5">Chest</th>
                      <th className="py-2.5 px-3.5">Waist</th>
                      <th className="py-2.5 px-3.5">Cut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
                    {APPAREL_SIZE_CHART.map((row) => (
                      <tr key={row.size}>
                        <td className="py-2 px-3.5 font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                          {row.size}
                        </td>
                        <td className="py-2 px-3.5 text-[#6e6e73] dark:text-[#86868b]">{row.chest}</td>
                        <td className="py-2 px-3.5 text-[#6e6e73] dark:text-[#86868b]">{row.waist}</td>
                        <td className="py-2 px-3.5 text-[#6e6e73] dark:text-[#86868b]">{row.fit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* How to Measure Guide */}
            <div className="rounded-2xl bg-[#f5f5f7] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.08] p-4 space-y-2 text-xs text-[#6e6e73] dark:text-[#86868b]">
              <p className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
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


