import React, { useEffect } from 'react';
import { Check } from 'lucide-react';

interface ColorSelectorProps {
  colors: string[];
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export function ColorSelector({
  colors,
  selectedColor,
  onSelectColor,
}: ColorSelectorProps) {
  // If only one color exists and nothing selected yet, select it automatically
  useEffect(() => {
    if (colors.length === 1 && !selectedColor) {
      onSelectColor(colors[0]);
    }
  }, [colors, selectedColor, onSelectColor]);

  if (!colors || colors.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
          Colourway
        </label>
        <span className="text-xs text-[#6e6e73] dark:text-[#86868b] font-medium">{selectedColor}</span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {colors.map((color) => {
          const isSelected = selectedColor === color;
          return (
            <button
              key={color}
              type="button"
              onClick={() => onSelectColor(color)}
              className={`px-4 py-2 min-h-[42px] text-xs font-semibold tracking-tight rounded-full border transition-all flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                isSelected
                  ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] border-[#1d1d1f] dark:border-white shadow-xs'
                  : 'bg-white dark:bg-[#1d1d1f] text-[#1d1d1f] dark:text-[#f5f5f7] border-black/[0.08] dark:border-white/[0.12] hover:border-black/25 dark:hover:border-white/30'
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />}
              <span>{color}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

