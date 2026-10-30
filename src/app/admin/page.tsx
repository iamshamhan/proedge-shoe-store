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
  AlertTriangle,
  Banknote,
  FolderTree,
} from 'lucide-react';
import { getAuthUser } from '@/lib/auth/admin';
import { getSupabaseServer } from '@/lib/supabase/server';
import { signOut } from './actions';
import { formatLKR } from '@/lib/currency';
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
  const results = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('products').select('id, name, slug, price, is_active, categories(name)')
      .order('created_at', { ascending: false }).limit(5),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders').select('id, order_number, customer_name, phone, city, total, status, created_at')
      .order('created_at', { ascending: false }).limit(5),
    supabase.rpc('admin_get_revenue_summary'),
    supabase.from('product_variants')
      .select('id, product_id, colour, size, size_system, size_value, stock, products!inner(id, name, slug, is_active)', { count: 'exact' })
      .eq('products.is_active', true).lte('stock', 3)
      .order('stock', { ascending: true }).limit(8),
  ]);
  if (results.some(result => result.error)) {
    throw new Error('Unable to load dashboard data. Please try again.');
  }
  const [
    { count: productCount },
    { count: activeCount },
    { data: recentProducts },
    { count: orderCount },
    { count: pendingOrderCount },
    { data: recentOrders },
    { data: revenue },
    { data: lowStockVariants, count: lowStockCount },
  ] = results;
  if (!revenue || !Number.isFinite(revenue.total) || !Number.isSafeInteger(revenue.count)) {
    throw new Error('Unable to load sales totals. Please try again.');
  }

  const stats = [
    {
      label: 'Confirmed Sales',
      value: formatLKR(revenue.total),
      sub: `${revenue.count} confirmed orders`,
      icon: Banknote,
      highlight: false,
    },
    {
      label: 'Pending WhatsApp',
      value: String(pendingOrderCount ?? 0),
      sub: `${orderCount ?? 0} total orders`,
      icon: Clock,
      highlight: (pendingOrderCount ?? 0) > 0,
    },
    {
      label: 'Active Products',
      value: `${activeCount ?? 0} / ${productCount ?? 0}`,
      sub: 'Live in storefront',
      icon: ShieldCheck,
      highlight: false,
    },
    {
      label: 'Low / Out of Stock',
      value: String(lowStockCount ?? 0),
      sub: 'Variants with ≤ 3 units',
      icon: AlertTriangle,
      highlight: (lowStockVariants ?? []).length > 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1d1d1f] dark:bg-white/[0.08] text-amber-500 soft-shadow">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.025em] text-[#1d1d1f] dark:text-[#f5f5f7]">Admin Dashboard</h1>
            <p className="text-sm text-[#6e6e73] dark:text-[#86868b]">
              Live sales, WhatsApp order queue, and inventory health
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          <Link
            href="/admin/orders"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#1d1d1f] px-4 py-2.5 text-xs font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06] soft-shadow"
          >
            <ClipboardList className="h-4 w-4 text-amber-500" />
            <span>Orders</span>
          </Link>
          <Link
            href="/admin/categories"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#1d1d1f] px-4 py-2.5 text-xs font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06] soft-shadow"
          >
            <FolderTree className="h-4 w-4 text-amber-500" />
            <span>Categories</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-amber-500 px-5 py-2.5 text-xs font-semibold tracking-tight text-zinc-950 transition-colors hover:bg-amber-400 soft-shadow"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards (2-col on mobile, 4-col on desktop) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-[24px] border bg-white dark:bg-[#1d1d1f] p-4 sm:p-5 soft-shadow ${
              stat.highlight
                ? 'border-amber-400/70 dark:border-amber-600/60'
                : 'border-black/[0.05] dark:border-white/[0.08]'
            }`}
          >
            <div className="flex items-center justify-between mb-2.5 sm:mb-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  stat.highlight
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    : 'bg-[#f5f5f7] dark:bg-white/[0.06] text-[#6e6e73] dark:text-[#86868b]'
                }`}
              >
                <stat.icon className="h-4 w-4" />
              </div>
              {stat.highlight && (
                <span className="text-[10px] font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-full">
                  Action
                </span>
              )}
            </div>
            <p
              className={`text-xl sm:text-2xl font-semibold tracking-tight truncate ${
                stat.highlight
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-[#1d1d1f] dark:text-[#f5f5f7]'
              }`}
            >
              {stat.value}
            </p>
            <p className="mt-0.5 sm:mt-1 text-xs font-semibold text-[#6e6e73] dark:text-[#86868b] truncate">
              {stat.label}
            </p>
            {stat.sub && (
              <p className="text-[11px] text-[#86868b] truncate mt-0.5">
                {stat.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Low Stock / Out of Stock Inventory Alert Banner */}
      {lowStockVariants && lowStockVariants.length > 0 && (
        <div className="rounded-[24px] border border-amber-300/70 dark:border-amber-800/60 bg-white dark:bg-[#1d1d1f] p-5 sm:p-6 soft-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <h2 className="text-sm font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                Inventory Restock Alerts ({lowStockVariants.length})
              </h2>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Manage All Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {lowStockVariants.map((v) => {
              const prod = Array.isArray(v.products) ? v.products[0] : v.products;
              const sizeLabel =
                v.size_system && v.size_system !== 'Custom'
                  ? `${v.size_system} ${v.size_value || v.size}`
                  : v.size_value || String(v.size);
              const isOut = v.stock <= 0;

              return (
                <Link
                  key={v.id}
                  href={`/admin/products/${v.product_id}`}
                  className="group rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-[#f5f5f7] dark:bg-white/[0.03] p-3.5 flex items-center justify-between gap-3 hover:border-amber-500 dark:hover:border-amber-500 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {prod?.name ?? 'Product'}
                    </p>
                    <p className="text-[11px] text-[#6e6e73] dark:text-[#86868b] mt-0.5 truncate">
                      {v.colour} · {sizeLabel}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                      isOut
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {isOut ? '0 Left' : `${v.stock} Left`}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

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
