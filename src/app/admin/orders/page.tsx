import { AdminPagination } from '@/components/admin/pagination';
import { adminPage, ADMIN_PAGE_SIZE, searchTerm, type AdminSearchParams } from '@/lib/admin-pagination';
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

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<AdminSearchParams> }) {
  const user = await getAuthUser();
  if (!user?.isAdmin) redirect('/admin/login');

  const supabase = await getSupabaseServer();

  const params = await searchParams;
  const page = adminPage(params.page);
  const term = searchTerm(params.q);
  let query = supabase.from('orders').select('*', { count: 'exact' });
  if (term) query = query.or(['order_number', 'customer_name', 'phone', 'city', 'email'].map(field => `${field}.ilike.%${term}%`).join(','));
  if (params.status && params.status !== 'all') query = query.eq('status', params.status);
  const { data: rawOrders, count, error } = await query.order('created_at', { ascending: false })
    .order('id').range((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE - 1);
  if (error) throw new Error(error.message);
  const orderItemCounts = rawOrders?.length ? await readAllRows((from, to) => supabase.from('order_items')
    .select('order_id, quantity').in('order_id', rawOrders.map(o => o.id)).order('id').range(from, to)) : [];
  const statusCounts = Object.fromEntries(await Promise.all(
    ['pending', 'confirmed', 'processing', 'ready_to_ship', 'shipped', 'delivered', 'cancelled'].map(async status => {
      const result = await supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', status);
      if (result.error) throw new Error(result.error.message);
      return [status, result.count ?? 0];
    })));

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

      <AdminPagination path="/admin/orders" params={params} page={page} total={count ?? 0} />
      <OrdersTable key={JSON.stringify(params)} initialOrders={orders} filters={params} statusCounts={statusCounts} />
    </div>
  );
}
