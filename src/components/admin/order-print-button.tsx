'use client';

import { Printer } from 'lucide-react';

export function OrderPrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      title="Print Order / Packing Slip"
      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3.5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors print:hidden"
    >
      <Printer className="w-4 h-4" />
      <span className="hidden sm:inline">Print Slip</span>
    </button>
  );
}
