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
    <section className="py-16 sm:py-24 bg-zinc-900 text-white border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-500 block mb-2">
            The PROEDGE Standard
          </span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
            Why Shop With Us
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-400">
            We deliver uncompromising quality and premium service from order placement to your doorstep.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all duration-300 flex flex-col items-center text-center group"
              >
                <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-5 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wide mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
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
