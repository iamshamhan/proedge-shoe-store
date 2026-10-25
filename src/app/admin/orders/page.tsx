import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getAuthUser } from '@/lib/auth/admin';
import { getSupabaseServer } from '@/lib/supabase/server';
import { OrdersTable, type AdminOrderSummary } from '@/components/admin/orders-table';
import { ClipboardList } from 'lucide-react';
import { readAllRows } from '@/lib/supabase/read-all';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Orders | Admin',
};

export default async function AdminOrdersPage() {
  const user = await getAuthUser();
  if (!user?.isAdmin) redirect('/admin/login');

  const supabase = await getSupabaseServer();

  // Fetch orders and item counts
  const [rawOrders, orderItemCounts] = await Promise.all([
    readAllRows((from, to) => supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false }).order('id').range(from, to)),
    readAllRows((from, to) => supabase
      .from('order_items')
      .select('order_id, quantity').order('id').range(from, to)),
  ]);

  const countMap = new Map<string, number>();
  for (const item of orderItemCounts ?? []) {
    countMap.set(
      item.order_id,
      (countMap.get(item.order_id) ?? 0) + (item.quantity ?? 1)
    );
  }

  const orders: AdminOrderSummary[] = (rawOrders ?? []).map((o) => ({
    id: o.id,
    revision: o.revision,
    order_number: o.order_number,
    customer_name: o.customer_name,
    phone: o.phone,
    whatsapp: o.whatsapp,
    email: o.email,
    address: o.address,
    city: o.city ?? '',
    postal_code: o.postal_code,
    delivery_fee: o.delivery_fee,
    subtotal: o.subtotal,
    total: o.total,
    notes: o.notes,
    status: o.status,
    created_at: o.created_at,
    item_count: countMap.get(o.id) ?? 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-800 text-amber-500">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-zinc-900 dark:text-white">
              Customer Orders
            </h1>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              Track orders submitted from your online store and WhatsApp checkout.
            </p>
          </div>
        </div>
      </div>

      <OrdersTable initialOrders={orders} />
    </div>
  );
}
