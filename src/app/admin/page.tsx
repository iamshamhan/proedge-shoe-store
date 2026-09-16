import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  LayoutDashboard,
  LogOut,
  Package,
  ShieldCheck,
  ShieldX,
  Boxes,
  ArrowRight,
} from 'lucide-react';
import { getAuthUser } from '@/lib/auth/admin';
import { getSupabaseServer } from '@/lib/supabase/server';
import { signOut } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin',
};

export default async function AdminPage() {
  const user = await getAuthUser();

  // No valid session → the admin area is protected server-side.
  if (!user) redirect('/admin/login');

  // Authenticated but not an admin: clearly deny access. No admin details are
  // exposed beyond the fact that the account lacks admin privileges.
  if (!user.isAdmin) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <ShieldX className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-zinc-900">
            Access Denied
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            Your account is signed in but does not have administrator
            privileges for the PROEDGE admin area.
          </p>
          <form action={signOut} className="mt-8">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-black uppercase tracking-wider text-zinc-900 transition-colors hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    );
  }

  const supabase = await getSupabaseServer();
  const { count: productCount } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true });
  const { count: variantCount } = await supabase
    .from('product_variants')
    .select('id', { count: 'exact', head: true });
  const { count: activeCount } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true);
  const { count: imageCount } = await supabase
    .from('product_images')
    .select('id', { count: 'exact', head: true });

  const stats = [
    { label: 'Products', value: productCount ?? 0, icon: Package },
    { label: 'Active', value: activeCount ?? 0, icon: ShieldCheck },
    { label: 'Variants', value: variantCount ?? 0, icon: Boxes },
    { label: 'Images', value: imageCount ?? 0, icon: LayoutDashboard },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-amber-500">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-black text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-400">Catalog overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-zinc-200 bg-white p-6"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
              <stat.icon className="h-4 w-4" />
            </div>
            <p className="text-3xl font-black text-zinc-900">{stat.value}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-zinc-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-black uppercase tracking-wider text-zinc-900">
          Quick Actions
        </h2>
        <Link
          href="/admin/products"
          className="group flex items-center justify-between rounded-xl border border-zinc-200 px-5 py-4 transition-colors hover:border-amber-500 hover:bg-amber-50/50"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-zinc-900">Product Management</p>
              <p className="text-sm text-zinc-400">
                View, create, edit, activate and delete products
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-zinc-300 transition-colors group-hover:text-amber-600" />
        </Link>
      </div>
    </div>
  );
}