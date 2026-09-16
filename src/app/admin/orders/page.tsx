import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ClipboardList } from 'lucide-react';
import { getAuthUser } from '@/lib/auth/admin';
import { getSupabaseServer } from '@/lib/supabase/server';
import { formatLKR } from '@/data/products';
import { STATUS_STYLES, isOrderStatus } from '@/lib/order-status';

export const metadata: Metadata = {
  title: 'Orders',
};

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  total: number;
  status: string;
  created_at: string;
  order_items: { quantity: number }[];
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

export default async function AdminOrdersPage() {
  const user = await getAuthUser();
  if (!user?.isAdmin) redirect('/admin/login');

  const supabase = await getSupabaseServer();
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, customer_name, phone, total, status, created_at, order_items(quantity)')
    .order('created_at', { ascending: false });

  const rows = (orders ?? []) as OrderRow[];

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-black text-zinc-900">Orders</h1>
          <p className="text-sm text-zinc-400">
            {rows.length} order{rows.length === 1 ? '' : 's'} in the system
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
          <ClipboardList className="mx-auto mb-4 h-12 w-12 text-zinc-300" />
          <p className="text-sm font-bold text-zinc-500">No orders yet.</p>
          <p className="mt-1 text-sm text-zinc-400">
            Orders placed through the checkout will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3">Order</th>
                <th className="hidden px-4 py-3 md:table-cell">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="hidden px-4 py-3 sm:table-cell">Items</th>
                <th className="hidden px-4 py-3 sm:table-cell">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map((order) => {
                const itemsCount = order.order_items.reduce((s, i) => s + i.quantity, 0);
                const status = isOrderStatus(order.status) ? order.status : 'pending';
                const statusClass =
                  STATUS_STYLES[status] ?? 'bg-zinc-100 text-zinc-700';

                return (
                  <tr key={order.id} className="transition-colors hover:bg-zinc-50/50">
                    <td className="px-4 py-3">
                      <span className="font-black text-zinc-900">#{order.order_number}</span>
                    </td>
                    <td className="hidden px-4 py-3 text-zinc-500 md:table-cell">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-zinc-900">{order.customer_name}</p>
                      <p className="text-xs text-zinc-400">{order.phone}</p>
                    </td>
                    <td className="hidden px-4 py-3 text-zinc-600 sm:table-cell">
                      {order.order_items.length} line{order.order_items.length === 1 ? '' : 's'} / {itemsCount} unit{itemsCount === 1 ? '' : 's'}
                    </td>
                    <td className="hidden px-4 py-3 font-bold text-zinc-900 sm:table-cell">
                      {formatLKR(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wide ${statusClass}`}
                      >
                        {status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="rounded-xl border border-zinc-200 bg-white px-4 py-1.5 text-xs font-bold text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}