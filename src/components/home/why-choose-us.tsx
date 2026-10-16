import React from 'react';
import { ShieldCheck, ShoppingBag, Truck, MessageSquare } from 'lucide-react';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Quality Products',
    description: '100% genuine craftsmanship, durable materials, and non-slip sole construction.',
  },
  {
    icon: ShoppingBag,
    title: 'Easy Ordering',
    description: 'Seamless online browsing with quick checkout options and instant confirmation.',
  },
  {
    icon: Truck,
    title: 'Islandwide Delivery',
    description: 'Fast and reliable door-to-door courier dispatch across all Sri Lankan districts.',
  },
  {
    icon: MessageSquare,
    title: 'WhatsApp Support',
    description: 'Direct 1-on-1 customer assist for sizing inquiries, availability, and custom assistance.',
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-16 sm:py-24 bg-[#f5f5f7] dark:bg-[#000000] border-t border-black/[0.06] dark:border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-semibold tracking-tight text-amber-600 dark:text-amber-400 block mb-1.5">
            The PROEDGE Difference
          </span>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-[-0.025em] text-[#1d1d1f] dark:text-white">
            Even more reasons to shop with us.
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-[#6e6e73] dark:text-[#86868b] leading-relaxed">
            Uncompromising quality and personal service from order placement to your doorstep.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#1d1d1f] p-7 rounded-[28px] border border-black/[0.05] dark:border-white/[0.08] soft-shadow hover:-translate-y-1 transition-all duration-300 flex flex-col items-start text-left group"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5 motion-safe:group-hover:bg-amber-500 motion-safe:group-hover:text-zinc-950 transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold tracking-tight text-[#1d1d1f] dark:text-white mb-1.5">
                  {feature.title}.
                </h3>
                <p className="text-xs sm:text-sm text-[#6e6e73] dark:text-[#86868b] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
