import type { ReactNode } from 'react';
import type { Metadata } from 'next';

// Admin pages depend on authenticated request state and must never be prerendered.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[70vh]">
      <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
    </div>
  );
}