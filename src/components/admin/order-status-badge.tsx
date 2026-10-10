import React from 'react';

type Props = {
  status: string;
  size?: 'sm' | 'md';
};

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending: {
    label: 'Pending',
    bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  confirmed: {
    label: 'Confirmed',
    bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  processing: {
    label: 'Processing',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
    text: 'text-indigo-700 dark:text-indigo-400',
    dot: 'bg-indigo-500',
  },
  ready_to_ship: {
    label: 'Ready to Ship',
    bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
    text: 'text-purple-700 dark:text-purple-400',
    dot: 'bg-purple-500',
  },
  shipped: {
    label: 'Shipped',
    bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800',
    text: 'text-sky-700 dark:text-sky-400',
    dot: 'bg-sky-500',
  },
  delivered: {
    label: 'Delivered',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
    text: 'text-rose-700 dark:text-rose-400',
    dot: 'bg-rose-500',
  },
};

export function OrderStatusBadge({ status, size = 'sm' }: Props) {
  const normalized = status.toLowerCase();
  const config = STATUS_CONFIG[normalized] || {
    label: status,
    bg: 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700',
    text: 'text-zinc-600 dark:text-zinc-400',
    dot: 'bg-zinc-400',
  };

  const sizeClasses =
    size === 'md'
      ? 'px-3 py-1 text-xs gap-2'
      : 'px-2.5 py-0.5 text-[11px] gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-bold uppercase tracking-wider rounded-full border ${config.bg} ${config.text} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}
