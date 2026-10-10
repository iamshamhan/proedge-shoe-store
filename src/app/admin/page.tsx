import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  LayoutDashboard,
  LogOut,
  Package,
  ShieldCheck,
  ShieldX,
  Plus,
  ArrowRight,
  ClipboardList,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { getAuthUser } from '@/lib/auth/admin';
import { getSupabaseServer } from '@/lib/supabase/server';
import { signOut } from './actions';
import { formatLKR } from '@/data/products';
import { OrderStatusBadge } from '@/components/admin/order-status-badge';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
};

export default async function AdminPage() {
  const user = await getAuthUser();

  if (!user) redirect('/admin/login');

  if (!user.isAdmin) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400">
            <ShieldX className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
            Access Denied
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            Your account is signed in but does not have administrator privileges for the PROEDGE admin area.
          </p>
          <form action={signOut} className="mt-8">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-6 py-3 text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white transition-colors hover:border-zinc-900 dark:hover:border-zinc-600 hover:bg-zinc-900 dark:hover:bg-zinc-700 hover:text-white"
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
  const [
    { count: productCount },
    { count: activeCount },
    { data: recentProducts },
    { count: orderCount },
    { count: pendingOrderCount },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase
      .from('products')
      .select('id, name, slug, price, is_active, categories(name)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase
      .from('orders')
      .select('id, order_number, customer_name, phone, city, total, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: 'Total Products', value: productCount ?? 0, icon: Package },
    { label: 'Active in Catalog', value: activeCount ?? 0, icon: ShieldCheck },
    { label: 'Total Orders', value: orderCount ?? 0, icon: ClipboardList },
    {
      label: 'Pending WhatsApp',
      value: pendingOrderCount ?? 0,
      icon: Clock,
      highlight: (pendingOrderCount ?? 0) > 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard Title & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-800 text-amber-500">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-zinc-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">Catalog and store overview</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <ClipboardList className="h-4 w-4" />
            View Orders
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-zinc-950 transition-colors hover:bg-amber-400"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border bg-white dark:bg-zinc-900 p-5 shadow-xs ${
              stat.highlight
                ? 'border-amber-300 dark:border-amber-800/80'
                : 'border-zinc-200 dark:border-zinc-800'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  stat.highlight
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <stat.icon className="h-4 w-4" />
              </div>
              {stat.highlight && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full">
                  Action Needed
                </span>
              )}
            </div>
            <p
              className={`text-3xl font-black ${
                stat.highlight
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-zinc-900 dark:text-white'
              }`}
            >
              {stat.value}
            </p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Two Column Grid: Recent Orders & Recent Catalog Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Widget */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                Recent Orders
              </h2>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
            >
              <span>All orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {(recentOrders ?? []).map((order) => (
              <div
                key={order.id}
                className="py-3 flex items-center justify-between text-sm hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
              >
                <div>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-bold text-zinc-900 dark:text-white hover:text-amber-500 transition-colors flex items-center gap-2"
                  >
                    <span>{order.order_number}</span>
                    <OrderStatusBadge status={order.status} />
                  </Link>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {order.customer_name} · {order.city}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-zinc-900 dark:text-white text-xs">
                    {formatLKR(order.total)}
                  </p>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}

            {(!recentOrders || recentOrders.length === 0) && (
              <div className="py-8 text-center text-zinc-400 text-xs">
                No orders received yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Catalog Products */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                Recent Catalog Products
              </h2>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
            >
              <span>View all products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {(recentProducts ?? []).map((product) => {
              const categoryName = Array.isArray(product.categories)
                ? product.categories[0]?.name
                : (product.categories as { name?: string } | null)?.name;

              return (
                <div key={product.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="font-bold text-zinc-900 dark:text-white hover:text-amber-500 transition-colors"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      {categoryName ?? 'Uncategorized'} • /{product.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-zinc-900 dark:text-white text-xs">
                      {formatLKR(product.price)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        product.is_active
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}