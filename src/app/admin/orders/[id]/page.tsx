import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ClipboardList, Package, User, Phone, MapPin, StickyNote } from 'lucide-react';
import { getAuthUser } from '@/lib/auth/admin';
import { getSupabaseServer } from '@/lib/supabase/server';
import { formatLKR } from '@/data/products';
import { OrderStatusUpdater } from '@/components/admin/order-status';
import { STATUS_STYLES, isOrderStatus } from '@/lib/order-status';

export const metadata: Metadata = {
  title: 'Order Details',
};

type OrderDetail = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string | null;
  postal_code: string | null;
  delivery_fee: number;
  subtotal: number;
  total: number;
  notes: string | null;
  status: string;
  created_at: string;
  order_items: {
    id: string;
    product_name: string;
    colour: string;
    size: number | string;
    size_system?: string | null;
    size_value?: string | null;
    quantity: number;
    unit_price: number;
  }[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAuthUser();
  if (!user?.isAdmin) redirect('/admin/login');

  const { id } = await params;

  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from('orders')
    .select(
      'id, order_number, customer_name, phone, email, address, city, postal_code, delivery_fee, subtotal, total, notes, status, created_at, order_items(id, product_name, colour, size, size_system, size_value, quantity, unit_price)',
    )
    .eq('id', id)
    .single();

  const order = data as OrderDetail | null;
  if (!order) notFound();

  const status = isOrderStatus(order.status) ? order.status : 'pending';
  const statusClass = STATUS_STYLES[status] ?? 'bg-zinc-100 text-zinc-700';

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-500 dark:text-zinc-400 transition-colors hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-black text-zinc-900 dark:text-white">Order #{order.order_number}</h1>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">Placed {formatDate(order.created_at)}</p>
        </div>
        <span
          className={`inline-block rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-wide ${statusClass}`}
        >
          {status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Customer + delivery details */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
              <User className="h-4 w-4 text-amber-500" />
              Customer
            </h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Name</dt>
                <dd className="mt-0.5 font-bold text-zinc-900 dark:text-white">{order.customer_name}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  <Phone className="h-3 w-3" /> Phone
                </dt>
                <dd className="mt-0.5 font-bold text-zinc-900 dark:text-white">{order.phone}</dd>
              </div>
              {order.email && (
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Email</dt>
                  <dd className="mt-0.5 text-zinc-700 dark:text-zinc-300">{order.email}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
              <MapPin className="h-4 w-4 text-amber-500" />
              Delivery
            </h2>
            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{order.address}</p>
            <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-white">
              {order.city}
              {order.postal_code ? `, ${order.postal_code}` : ''}
            </p>
            {order.notes && (
              <p className="mt-4 flex items-start gap-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 px-3 py-2.5 text-xs text-zinc-600 dark:text-zinc-300">
                <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                {order.notes}
              </p>
            )}
          </div>

          <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
        </div>

        {/* Items + totals */}
        <div className="space-y-6 lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h2 className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
              <Package className="h-4 w-4 text-amber-500" />
              Items ({order.order_items.length})
            </h2>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  <th className="px-6 py-2.5">Product</th>
                  <th className="px-4 py-2.5">Colour / Size</th>
                  <th className="px-4 py-2.5">Qty</th>
                  <th className="px-4 py-2.5 text-right">Unit Price</th>
                  <th className="px-6 py-2.5 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {order.order_items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-3 font-bold text-zinc-900 dark:text-white">{item.product_name}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                      {item.colour} / {item.size_system && item.size_system !== 'Custom' ? `${item.size_system} ${item.size_value || item.size}` : (item.size_value || item.size)}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-300">
                      {formatLKR(item.unit_price)}
                    </td>
                    <td className="px-6 py-3 text-right font-bold text-zinc-900 dark:text-white">
                      {formatLKR(item.unit_price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 px-6 py-5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Subtotal</span>
                <span className="font-bold text-zinc-900 dark:text-white">{formatLKR(order.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Delivery Fee</span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  {order.delivery_fee === 0 ? 'FREE' : formatLKR(order.delivery_fee)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-2">
                <span className="text-sm font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Total
                </span>
                <span className="text-xl font-black text-zinc-900 dark:text-white">{formatLKR(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 px-5 py-4 text-xs text-amber-900 dark:text-amber-300">
            <ClipboardList className="h-4 w-4 shrink-0" />
            <span>
              Totals were calculated server-side at the time of order placement from the
              catalogue price and stock. A status change does not affect the recorded amounts.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}