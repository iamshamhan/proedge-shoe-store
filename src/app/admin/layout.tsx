import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { LayoutDashboard, Package, ClipboardList, LogOut } from 'lucide-react';
import { getAuthUser } from '@/lib/auth/admin';
import { signOut } from './actions';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getAuthUser();

  return (
    <div className="min-h-[70vh]">
      {user?.isAdmin && (
        <nav className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4">
            <Link
              href="/admin"
              className="mr-auto text-sm font-black uppercase tracking-wider text-zinc-900"
            >
              PROEDGE<span className="text-amber-600"> Admin</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 transition-colors hover:text-zinc-900"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 transition-colors hover:text-zinc-900"
            >
              <Package className="h-4 w-4" />
              Products
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 transition-colors hover:text-zinc-900"
            >
              <ClipboardList className="h-4 w-4" />
              Orders
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 transition-colors hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </form>
          </div>
        </nav>
      )}
      <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
    </div>
  );
}