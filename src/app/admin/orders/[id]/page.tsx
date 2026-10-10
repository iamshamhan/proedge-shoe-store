import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowLeft,
  Calendar,
  MessageCircle,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  Package,
} from 'lucide-react';
import { getAuthUser } from '@/lib/auth/admin';
import { getSupabaseServer } from '@/lib/supabase/server';
import { formatLKR } from '@/data/products';
import { OrderStatusBadge } from '@/components/admin/order-status-badge';
import { OrderStatusSelect } from '@/components/admin/order-status-select';
import { OrderDeleteButton } from '@/components/admin/order-delete-button';
import { OrderDetailActions } from '@/components/admin/order-detail-actions';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Order Details | Admin',
  };
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

  // Fetch the order
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !order) {
    notFound();
  }

  // Fetch items for this order
  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id);

  const getWhatsAppLink = () => {
    let clean = order.phone.replace(/[^0-9]/g, '');
    if (clean.length === 10 && clean.startsWith('0')) {
      clean = '94' + clean.substring(1);
    }
    const message = encodeURIComponent(
      `Hello ${order.customer_name}! This is PROEDGE regarding your order #${order.order_number}.`
    );
    return `https://wa.me/${clean}?text=${message}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('en-LK', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black text-zinc-900 dark:text-white font-mono">
                {order.order_number}
              </h1>
              <OrderStatusBadge status={order.status} size="md" />
            </div>
            <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Placed on {formatDate(order.created_at)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white transition-colors shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>

          <OrderDeleteButton
            orderId={order.id}
            orderNumber={order.order_number}
            redirectToList={true}
          />
        </div>
      </div>

      {/* Verification Status & Action Banner */}
      <OrderDetailActions order={order} />

      {/* Main Order Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Items & Financials */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Table */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Ordered Items ({items?.length ?? 0})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 border-b border-zinc-100 dark:border-zinc-800">
                  <tr>
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">Size / Colour</th>
                    <th className="px-5 py-3 text-center">Qty</th>
                    <th className="px-5 py-3 text-right">Price</th>
                    <th className="px-5 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {(items ?? []).map((item) => {
                    const lineTotal = item.quantity * item.unit_price;
                    return (
                      <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                        <td className="px-5 py-3.5 font-bold text-zinc-900 dark:text-white">
                          {item.product_name}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-zinc-500">
                          <span>{item.colour}</span>
                          {item.size && (
                            <span className="ml-1.5 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-700 dark:text-zinc-300">
                              Size {item.size}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center font-bold text-zinc-900 dark:text-white">
                          {item.quantity}
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          {formatLKR(item.unit_price)}
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold text-zinc-900 dark:text-white whitespace-nowrap">
                          {formatLKR(lineTotal)}
                        </td>
                      </tr>
                    );
                  })}
                  {(!items || items.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-5 py-6 text-center text-zinc-400 text-xs">
                        No item records attached to this order.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="p-5 bg-zinc-50/60 dark:bg-zinc-900/60 border-t border-zinc-100 dark:border-zinc-800 space-y-2 text-sm">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Subtotal</span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {formatLKR(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Delivery Fee</span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {order.delivery_fee > 0 ? formatLKR(order.delivery_fee) : 'Free'}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-zinc-900 dark:text-white border-t border-zinc-200 dark:border-zinc-800 pt-3 mt-2">
                <span>Grand Total</span>
                <span className="text-amber-600 dark:text-amber-400">
                  {formatLKR(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Customer & Status Controls */}
        <div className="space-y-6">
          {/* Status Changer Card */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Update Order Status
            </h2>
            <div className="pt-1">
              <OrderStatusSelect
                orderId={order.id}
                currentStatus={order.status}
                size="md"
              />
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed pt-2 border-t border-zinc-100 dark:border-zinc-800">
              Changing to <strong>Cancelled</strong> automatically restores reserved stock back to your product inventory.
            </p>
          </div>

          {/* Customer Card */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <User className="w-4 h-4 text-amber-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Customer Details
              </h2>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-zinc-400 font-medium">Full Name</p>
                <p className="font-bold text-zinc-900 dark:text-white">
                  {order.customer_name}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-400 font-medium">Contact Phone</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <a
                    href={`tel:${order.phone}`}
                    className="font-bold text-zinc-900 dark:text-white hover:text-amber-500"
                  >
                    {order.phone}
                  </a>
                </div>
              </div>

              {order.email && (
                <div>
                  <p className="text-xs text-zinc-400 font-medium">Email Address</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {order.email}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Delivery Address</span>
                </p>
                <p className="font-medium text-zinc-800 dark:text-zinc-200 mt-1 leading-relaxed">
                  {order.address}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {order.city} {order.postal_code ? `· Postal: ${order.postal_code}` : ''}
                </p>
              </div>

              {order.notes && (
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Customer Notes</span>
                  </p>
                  <p className="text-xs italic text-zinc-600 dark:text-zinc-400 mt-1 bg-zinc-50 dark:bg-zinc-800 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-700">
                    &ldquo;{order.notes}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
