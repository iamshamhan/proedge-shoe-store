'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import { updateOrderStatus } from '@/app/admin/actions';
import { ORDER_STATUSES, isOrderStatus, type OrderStatus } from '@/lib/order-status';

export function OrderStatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(
    isOrderStatus(currentStatus) ? currentStatus : 'pending',
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);

    const result = await updateOrderStatus(orderId, status);
    if ('error' in result) {
      setError(result.error);
      setSaving(false);
      return;
    }

    setMessage('Status updated.');
    setSaving(false);
    router.refresh();
  };

  const labelClass = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400';

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
      <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
        Update Status
      </h3>

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-4 py-2.5 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
      {message && (
        <p className="mb-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2.5 text-sm text-emerald-700 dark:text-emerald-300">
          {message}
        </p>
      )}

      <label htmlFor="order-status" className={labelClass}>
        Order status
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          id="order-status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as OrderStatus);
            setMessage(null);
          }}
          className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2.5 text-sm text-zinc-900 dark:text-white outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || status === currentStatus}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-amber-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white dark:text-zinc-950 transition-colors hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-zinc-950 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </button>
      </div>
    </div>
  );
}