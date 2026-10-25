'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, Edit3, AlertCircle } from 'lucide-react';
import { OrderCompleteModal } from './order-complete-modal';
import { OrderCancelButton } from './order-cancel-button';

interface Props {
  order: {
    id: string;
    revision: number;
    order_number: string;
    customer_name: string;
    delivery_fee: number;
    status: string;
    notes?: string | null;
  };
}

export function OrderDetailActions({ order }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isPending = order.status === 'pending';
  const isConfirmed = order.status === 'confirmed';
  const isCancelled = order.status === 'cancelled';

  return (
    <>
      {/* Verification Status Banner */}
      {isPending && (
        <div className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-black text-amber-900 dark:text-amber-200">
                  WhatsApp Inquiry — Awaiting Admin Confirmation
                </h2>
                <p className="text-xs text-amber-800/90 dark:text-amber-300/80 leading-relaxed max-w-xl">
                  This order came from the web cart to WhatsApp. <strong>No stock has been deducted yet.</strong> Once you verify what the customer is buying on WhatsApp, click <strong>Confirm Sale</strong> to pick the final items and deduct stock. If they don&apos;t buy, click <strong>Cancel</strong>.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <OrderCancelButton
                revision={order.revision}
                orderId={order.id}
                orderNumber={order.order_number}
                currentStatus={order.status}
                size="md"
              />

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Confirm Sale (Done)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isConfirmed && (
        <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800/70 bg-emerald-50/70 dark:bg-emerald-950/30 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                  Sale Confirmed — Stock Deducted
                </h2>
                <p className="text-xs text-emerald-800/90 dark:text-emerald-300/80 leading-relaxed">
                  The items below are confirmed as purchased. Inventory was safely deducted from the live store.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-zinc-700 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Adjust Sale Items</span>
              </button>

              <OrderCancelButton
                revision={order.revision}
                orderId={order.id}
                orderNumber={order.order_number}
                currentStatus={order.status}
                size="md"
              />
            </div>
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-500">
              <XCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                This inquiry was cancelled.
              </p>
              <p className="text-[11px] text-zinc-400">
                No inventory stock was retained or deducted for this order.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Complete/Adjust Modal */}
      <OrderCompleteModal
        isOpen={isModalOpen}
        orderId={order.id}
        orderNumber={order.order_number}
        customerName={order.customer_name}
        deliveryFee={order.delivery_fee}
        initialNotes={order.notes}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => setIsModalOpen(false)}
      />
    </>
  );
}
