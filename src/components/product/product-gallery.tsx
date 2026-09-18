'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Fallback image if images array is empty
  const imageList = images && images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop'
  ];

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % imageList.length);
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Large Image Display */}
      <div className="relative aspect-square w-full rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden group shadow-xs">
        <Image
          src={imageList[selectedIndex]}
          alt={`${productName} - Image ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-center transition-all duration-300"
        />

        {/* Prev / Next Controls (shown if more than 1 image) */}
        {imageList.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xs text-zinc-900 dark:text-white shadow-md hover:bg-white dark:hover:bg-zinc-800 transition-all opacity-90 sm:opacity-0 group-hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xs text-zinc-900 dark:text-white shadow-md hover:bg-white dark:hover:bg-zinc-800 transition-all opacity-90 sm:opacity-0 group-hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:opacity-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {imageList.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
          {imageList.map((img, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                aria-label={`View thumbnail ${idx + 1}`}
                className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  isSelected
                    ? 'border-amber-500 shadow-sm scale-95'
                    : 'border-zinc-200 dark:border-zinc-800 opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={img}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover object-center"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
