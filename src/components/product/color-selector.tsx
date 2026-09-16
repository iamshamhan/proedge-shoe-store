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
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-900">
          Colour Way
        </label>
        <span className="text-xs text-zinc-500 font-semibold">{selectedColor}</span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {colors.map((color) => {
          const isSelected = selectedColor === color;
          return (
            <button
              key={color}
              type="button"
              onClick={() => onSelectColor(color)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border-2 transition-all flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
                isSelected
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
              <span>{color}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
