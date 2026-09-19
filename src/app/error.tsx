'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-500 mb-6 shadow-sm">
          <AlertCircle className="h-8 w-8" strokeWidth={2.5} />
        </div>
        
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl mb-3">
          Something went wrong
        </h1>
        
        <p className="text-sm font-medium leading-relaxed text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm">
          We experienced an unexpected issue processing your request. Our team has been notified.
        </p>
        
        <div className="flex flex-col sm:flex-row w-full gap-3 sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-xl bg-zinc-900 dark:bg-white px-6 py-3 text-sm font-black uppercase tracking-wider text-white dark:text-zinc-900 transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border-2 border-zinc-200 dark:border-zinc-800 bg-transparent px-6 py-3 text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white transition-colors hover:border-zinc-900 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white"
          >
            Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
