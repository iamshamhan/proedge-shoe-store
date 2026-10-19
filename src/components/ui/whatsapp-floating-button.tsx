'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useStoreSettings } from '@/context/settings-context';
import { formatWhatsAppChatUrl } from '@/lib/whatsapp';

export function WhatsAppFloatingButton() {
  const pathname = usePathname();
  const { whatsappNumber } = useStoreSettings();
  const [isHovered, setIsHovered] = useState(false);

  // Do not render floating widget inside the Admin management workspace
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // On product detail pages, the mobile view has a sticky Add-to-Bag bar (~64px).
  // Lift the floating button slightly higher on mobile for product pages to prevent overlapping.
  const isProductPage = pathname?.startsWith('/product/');
  const mobileBottomClass = isProductPage
    ? 'bottom-[calc(5.5rem+env(safe-area-inset-bottom))]'
    : 'bottom-[calc(1.25rem+env(safe-area-inset-bottom))]';

  const whatsappUrl = formatWhatsAppChatUrl(
    whatsappNumber,
    'Hello PROEDGE team! I have an inquiry from the website.',
  );

  return (
    <aside
      aria-label="WhatsApp live concierge"
      className={`fixed right-4 sm:right-6 ${mobileBottomClass} sm:bottom-6 z-40 flex items-center justify-end group print:hidden`}
    >
      {/* Tooltip Pill (Desktop & Tablet) */}
      <div
        className={`hidden md:flex items-center gap-2 mr-3 px-3.5 py-1.5 rounded-full bg-[#1d1d1f]/95 dark:bg-white/95 apple-glass text-white dark:text-[#1d1d1f] text-xs font-semibold tracking-tight shadow-lg transition-all duration-300 pointer-events-none select-none ${
          isHovered
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-2'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
        <span>Chat on WhatsApp</span>
      </div>

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Chat with PROEDGE team on WhatsApp"
        className="relative w-14 h-14 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-[0_6px_24px_rgba(37,211,102,0.45)] hover:shadow-[0_8px_30px_rgba(37,211,102,0.65)] hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 cursor-pointer"
      >
        {/* Subtle breathing ripple pulse on load/idle */}
        <span
          className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none"
          style={{ animationDuration: '3s' }}
        />

        {/* Authentic WhatsApp Icon SVG */}
        <svg
          viewBox="0 0 24 24"
          width="30"
          height="30"
          fill="currentColor"
          className="w-7 h-7 sm:w-7 sm:h-7 relative z-10 transition-transform group-hover:rotate-6"
          aria-hidden="true"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      </a>
    </aside>
  );
}
