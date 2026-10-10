'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { cancelOrderInquiry } from '@/app/admin/actions';
import { ConfirmDialog } from './confirm-dialog';

type Props = {
  orderId: string;
  orderNumber: string;
  currentStatus: string;
  redirectToList?: boolean;
  size?: 'sm' | 'md';
};

export function OrderCancelButton({
  orderId,
  orderNumber,
  currentStatus,
  redirectToList = false,
  size = 'md',
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (currentStatus === 'cancelled') {
    return null;
  }

  const handleCancel = () => {
    setError(null);
    startTransition(async () => {
      const res = await cancelOrderInquiry(orderId);
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

  const isPendingInquiry = currentStatus === 'pending';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isPending}
        title={isPendingInquiry ? 'Cancel Inquiry (No stock effect)' : 'Cancel Order (Restores stock)'}
        className={`inline-flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-bold uppercase tracking-wider hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50 ${
          size === 'sm' ? 'px-2.5 py-1.5 text-[11px]' : 'px-3.5 py-2 text-xs'
        }`}
      >
        <XCircle className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        <span>Cancel</span>
      </button>

      {error && (
        <span className="text-[11px] text-red-600 dark:text-red-400 font-medium ml-2">
          {error}
        </span>
      )}

      <ConfirmDialog
        open={open}
        title={
          isPendingInquiry
            ? `Cancel Inquiry ${orderNumber}?`
            : `Cancel Order ${orderNumber}?`
        }
        message={
          isPendingInquiry
            ? `Are you sure you want to cancel inquiry #${orderNumber}? The customer did not complete the purchase on WhatsApp. No stock has been deducted, so your inventory remains completely untouched.`
            : `Are you sure you want to cancel order #${orderNumber}? Since this order was previously confirmed, reserved stock will be automatically returned to your inventory.`
        }
        confirmLabel={isPendingInquiry ? 'Yes, Cancel Inquiry' : 'Cancel Order & Return Stock'}
        destructive
        loading={isPending}
        onConfirm={handleCancel}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
