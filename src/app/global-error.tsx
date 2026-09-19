'use client';

import { useEffect } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 antialiased">
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md text-center">
            <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900 mb-4">
              Critical Error
            </h1>
            <p className="text-sm font-medium text-zinc-500 mb-8">
              A critical error occurred while rendering the application.
            </p>
            <button
              onClick={() => reset()}
              className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-6 py-4 text-sm font-black uppercase tracking-wider text-white transition-colors hover:bg-zinc-800"
            >
              Recover Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
