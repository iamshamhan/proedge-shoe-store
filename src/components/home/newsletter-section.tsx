'use client';

import React, { useState } from 'react';
import { Mail, Check } from 'lucide-react';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-12 shadow-sm">
          <div className="w-12 h-12 bg-zinc-900 dark:bg-zinc-800 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
            Stay Ahead Of The Curve
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            Subscribe to receive exclusive access to new PROEDGE drops, seasonal sales, and member-only perks.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3.5 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-amber-500 transition-all"
            />
            <button
              type="submit"
              className="px-6 py-3.5 bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-zinc-950 transition-colors shrink-0 flex items-center justify-center gap-2"
            >
              {isSubscribed ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Subscribed!</span>
                </>
              ) : (
                <span>Subscribe</span>
              )}
            </button>
          </form>

          {isSubscribed && (
            <p role="status" className="mt-3 text-xs text-emerald-600 font-semibold">
              Thank you for subscribing to PROEDGE updates!
            </p>
          )}

          <p className="mt-4 text-[11px] text-zinc-400">
            By subscribing, you agree to receive promotional updates. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
