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
      <div className="relative aspect-square w-full rounded-[28px] bg-white dark:bg-[#1d1d1f] border border-black/[0.05] dark:border-white/[0.08] overflow-hidden group soft-shadow" style={{ position: 'relative' }}>
        <Image
          src={imageList[selectedIndex]}
          alt={`${productName} - Image ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-center transition-all duration-500"
        />

        {/* Prev / Next Controls (shown if more than 1 image) */}
        {imageList.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 dark:bg-black/75 apple-glass text-[#1d1d1f] dark:text-[#f5f5f7] shadow-md hover:bg-white dark:hover:bg-black transition-all opacity-90 sm:opacity-0 group-hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 dark:bg-black/75 apple-glass text-[#1d1d1f] dark:text-[#f5f5f7] shadow-md hover:bg-white dark:hover:bg-black transition-all opacity-90 sm:opacity-0 group-hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:opacity-100"
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
                className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  isSelected
                    ? 'border-[#1d1d1f] dark:border-amber-400 shadow-sm scale-95'
                    : 'border-black/[0.06] dark:border-white/[0.08] opacity-65 hover:opacity-100'
                }`}
                style={{ position: 'relative' }}
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
