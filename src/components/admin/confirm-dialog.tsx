'use client';

import React, { useEffect } from 'react';
import { Loader2, AlertTriangle, XCircle, AlertCircle } from 'lucide-react';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  badge?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  destructive?: boolean;
  error?: string | null;
};

export function ConfirmDialog({
  open,
  title,
  badge,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading,
  destructive,
  error,
}: ConfirmDialogProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl text-center animate-in zoom-in-95 duration-150">
        {/* Centered Status Icon */}
        <div
          className={`mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl ${
            destructive
              ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400'
              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
          }`}
        >
          {destructive ? (
            <XCircle className="h-6 w-6 stroke-[2.2]" />
          ) : (
            <AlertTriangle className="h-6 w-6" />
          )}
        </div>

        {/* Title & Optional Identifier Badge */}
        <h3 className="text-base font-black text-zinc-900 dark:text-white leading-tight">
          {title}
        </h3>

        {badge && (
          <div className="mt-1.5">
            <span className="inline-block font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              {badge}
            </span>
          </div>
        )}

        {/* Message */}
        <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed px-1">
          {message}
        </p>

        {/* Error inside modal */}
        {error && (
          <div className="mt-3 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-colors disabled:opacity-50 shadow-xs ${
              destructive
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-amber-400'
            }`}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}