'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useStoreSettings } from '@/context/settings-context';

export function NewsletterSection() {
  const { whatsappNumber } = useStoreSettings();

  const handleWhatsApp = () => {
    if (!whatsappNumber) return;
    const cleanNumber = whatsappNumber.replace(/[^0-9+]/g, '');
    const message = encodeURIComponent('Hello PROEDGE team! I have an inquiry.');
    window.open("https://wa.me/" + (cleanNumber.startsWith('+') ? cleanNumber.slice(1) : cleanNumber) + "?text=" + message, '_blank');
  };

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-12 shadow-sm">
          <div className="w-12 h-12 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
            Need Help With Your Order?
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            Got doubts about sizing, bulk orders, or custom team kits? Reach out to us directly on WhatsApp for instant support.
          </p>

          <div className="mt-8">
            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#25D366] text-white text-sm font-black uppercase tracking-wider rounded-xl hover:bg-[#128C7E] transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#25D366]/30"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Chat on WhatsApp</span>
            </button>
            <p className="mt-3 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
              {whatsappNumber || 'Available 24/7'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

