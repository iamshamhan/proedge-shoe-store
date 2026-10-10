'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { deleteOrder } from '@/app/admin/actions';
import { ConfirmDialog } from './confirm-dialog';

type Props = {
  orderId: string;
  orderNumber: string;
  redirectToList?: boolean;
};

export function OrderDeleteButton({
  orderId,
  orderNumber,
  redirectToList = false,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const res = await deleteOrder(orderId);
      if ('error' in res) {
        setError(res.error);
      } else {
        setOpen(false);
        if (redirectToList) {
          router.push('/admin/orders');
        }
        router.refresh();
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isPending}
        title="Delete Order"
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 p-2 text-xs font-bold text-zinc-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Delete</span>
      </button>

      {error && (
        <span className="text-[11px] text-red-600 dark:text-red-400 font-medium ml-2">
          {error}
        </span>
      )}

      <ConfirmDialog
        open={open}
        title={`Delete Order ${orderNumber}?`}
        message="Are you sure you want to permanently delete this order? This action cannot be undone."
        confirmLabel="Delete Order"
        destructive
        loading={isPending}
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
