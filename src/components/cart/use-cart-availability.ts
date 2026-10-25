'use client';

import { useEffect, useState } from 'react';
import type { CartItem } from '@/context/cart-context';
import { checkCart } from '@/app/checkout/cart-actions';
import { cartFingerprint } from '@/lib/cart';

export function useCartAvailability(items: CartItem[]) {
  const fingerprint = cartFingerprint(items);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ fingerprint: string; attempt: number; error?: string } | null>(null);
  useEffect(() => {
    if (!items.length) return;
    let active = true;
    checkCart(items).then(checked => {
      if (active) setResult({ fingerprint, attempt, error: checked.error });
    }).catch(() => {
      if (active) setResult({ fingerprint, attempt, error: 'Could not check availability. Please try again.' });
    });
    return () => { active = false; };
  }, [items, fingerprint, attempt]);
  const checking = items.length > 0 && (result?.fingerprint !== fingerprint || result?.attempt !== attempt);
  return { checking, error: checking ? undefined : result?.error, retry: () => setAttempt(value => value + 1) };
}
