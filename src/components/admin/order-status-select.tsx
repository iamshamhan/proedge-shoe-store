'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { updateOrderStatus } from '@/app/admin/actions';
import { type OrderStatus, VALID_ORDER_STATUSES } from '@/types/order';

type Props = {
  orderId: string;
  currentStatus: string;
  size?: 'sm' | 'md';
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending (WhatsApp)',
  confirmed: 'Confirmed',
  processing: 'Processing',
  ready_to_ship: 'Ready to Ship',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function OrderStatusSelect({
  orderId,
  currentStatus,
  size = 'sm',
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string>(currentStatus);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (newStatus: string) => {
    if (newStatus === status) return;
    setError(null);
    setStatus(newStatus);

    startTransition(async () => {
      const res = await updateOrderStatus(orderId, newStatus as OrderStatus);
      if ('error' in res) {
        setError(res.error);
        setStatus(currentStatus); // Revert on failure
      } else {
        router.refresh();
      }
    });
  };

  const selectClasses =
    size === 'md'
      ? 'rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/20'
      : 'rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1 text-xs font-semibold outline-none focus:ring-1 focus:ring-amber-500';

  return (
    <div className="inline-flex items-center gap-2">
      <div className="relative inline-flex items-center">
        <select
          value={status}
          disabled={isPending}
          onChange={(e) => handleChange(e.target.value)}
          className={`${selectClasses} text-zinc-900 dark:text-white cursor-pointer disabled:opacity-50`}
        >
          {VALID_ORDER_STATUSES.map((st) => (
            <option key={st} value={st}>
              {STATUS_LABELS[st]}
            </option>
          ))}
        </select>
        {isPending && (
          <span className="absolute right-6 pointer-events-none">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
          </span>
        )}
      </div>

      {error && (
        <span className="text-[11px] text-red-600 dark:text-red-400 font-medium">
          {error}
        </span>
      )}
    </div>
  );
}
