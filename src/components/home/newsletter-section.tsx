'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useStoreSettings } from '@/context/settings-context';
import { formatWhatsAppChatUrl } from '@/lib/whatsapp';

export function NewsletterSection() {
  const { whatsappNumber } = useStoreSettings();

  const handleWhatsApp = () => {
    const url = formatWhatsAppChatUrl(
      whatsappNumber,
      'Hello PROEDGE team! I would like some advice on sizing and gear.',
    );
    window.open(url, '_blank');
  };

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-[#0a0a0c] border-t border-black/[0.06] dark:border-white/[0.08] transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-[#f5f5f7] dark:bg-[#1d1d1f] border border-black/[0.05] dark:border-white/[0.08] rounded-[32px] p-8 sm:p-14 soft-shadow">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5">
            <MessageCircle className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-semibold text-[#1d1d1f] dark:text-white tracking-[-0.025em]">
            Need help choosing the right fit?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#6e6e73] dark:text-[#86868b] max-w-md mx-auto leading-relaxed">
            Chat one-on-one with a PROEDGE specialist on WhatsApp for sizing advice, availability, or team orders.
          </p>

          <div className="mt-8">
            <button
              type="button"
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#25D366] text-white text-sm font-semibold tracking-tight rounded-full hover:bg-[#1ebd5a] active:scale-[0.98] transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-[#25D366]/30 min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat with a Specialist</span>
            </button>
            <p className="mt-3 text-xs font-medium text-[#6e6e73] dark:text-[#86868b]">
              {whatsappNumber || '+94 76 387 1280'} • Available 24/7 on WhatsApp
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

