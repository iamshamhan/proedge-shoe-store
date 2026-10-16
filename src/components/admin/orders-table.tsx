'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  MessageCircle,
  ExternalLink,
  Calendar,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  Plus,
} from 'lucide-react';
import { formatLKR } from '@/data/products';
import { OrderStatusSelect } from './order-status-select';
import { OrderDeleteButton } from './order-delete-button';
import { OrderCancelButton } from './order-cancel-button';
import { OrderCompleteModal } from './order-complete-modal';
import { ManualOrderModal } from './manual-order-modal';

export interface AdminOrderSummary {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  email?: string | null;
  address: string;
  city: string;
  postal_code?: string | null;
  delivery_fee: number;
  subtotal: number;
  total: number;
  notes?: string | null;
  status: string;
  created_at: string;
  items_summary?: string;
  item_count?: number;
}

type Props = {
  initialOrders: AdminOrderSummary[];
};

export function OrdersTable({ initialOrders }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedForCompletion, setSelectedForCompletion] = useState<AdminOrderSummary | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const filteredOrders = useMemo(() => {
    return initialOrders.filter((order) => {
      // Status filter
      if (statusFilter !== 'all' && order.status.toLowerCase() !== statusFilter) {
        return false;
      }

      // Search filter
      if (!search.trim()) return true;
      const query = search.toLowerCase().trim();
      return (
        order.order_number.toLowerCase().includes(query) ||
        order.customer_name.toLowerCase().includes(query) ||
        order.phone.toLowerCase().includes(query) ||
        order.city.toLowerCase().includes(query) ||
        (order.email && order.email.toLowerCase().includes(query))
      );
    });
  }, [initialOrders, search, statusFilter]);

  const stats = useMemo(() => {
    const total = initialOrders.length;
    const pending = initialOrders.filter((o) => o.status === 'pending').length;
    const confirmed = initialOrders.filter((o) =>
      ['confirmed', 'processing', 'ready_to_ship', 'shipped', 'delivered'].includes(o.status)
    ).length;
    const cancelled = initialOrders.filter((o) => o.status === 'cancelled').length;

    return { total, pending, confirmed, cancelled };
  }, [initialOrders]);

  const getWhatsAppLink = (order: AdminOrderSummary) => {
    let clean = order.phone.replace(/[^0-9]/g, '');
    if (clean.length === 10 && clean.startsWith('0')) {
      clean = '94' + clean.substring(1);
    }
    const statusNote =
      order.status === 'confirmed'
        ? 'Your order has been confirmed and is being prepared!'
        : order.status === 'shipped'
          ? 'Great news! Your order has been dispatched for delivery.'
          : 'We received your order inquiry and would love to confirm your items.';
    const message = encodeURIComponent(
      `Hello ${order.customer_name}! This is PROEDGE Sports regarding your order *${order.order_number}* (${formatLKR(order.total)}).\n\n${statusNote}`
    );
    return `https://wa.me/${clean}?text=${message}`;
  };

  const handleExportCsv = () => {
    if (filteredOrders.length === 0) return;
    const escapeCsv = (val: unknown) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    const headers = [
      'Order Number',
      'Date',
      'Status',
      'Customer Name',
      'Phone',
      'Email',
      'City',
      'Address',
      'Postal Code',
      'Items Count',
      'Subtotal (LKR)',
      'Delivery Fee (LKR)',
      'Total (LKR)',
      'Notes',
    ];

    const rows = filteredOrders.map((o) => [
      escapeCsv(o.order_number),
      escapeCsv(new Date(o.created_at).toISOString()),
      escapeCsv(o.status),
      escapeCsv(o.customer_name),
      escapeCsv(o.phone),
      escapeCsv(o.email || ''),
      escapeCsv(o.city),
      escapeCsv(o.address),
      escapeCsv(o.postal_code || ''),
      escapeCsv(o.item_count ?? 0),
      escapeCsv(o.subtotal),
      escapeCsv(o.delivery_fee),
      escapeCsv(o.total),
      escapeCsv(o.notes || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateSlug = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute('download', `proedge-orders-${dateSlug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('en-LK', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const statusTabs = [
    { id: 'all', label: 'All Orders', count: initialOrders.length },
    {
      id: 'pending',
      label: 'Pending WhatsApp',
      count: initialOrders.filter((o) => o.status === 'pending').length,
    },
    {
      id: 'confirmed',
      label: 'Confirmed',
      count: initialOrders.filter((o) => o.status === 'confirmed').length,
    },
    {
      id: 'processing',
      label: 'Processing',
      count: initialOrders.filter((o) => o.status === 'processing').length,
    },
    {
      id: 'shipped',
      label: 'Shipped',
      count: initialOrders.filter((o) => o.status === 'shipped').length,
    },
    {
      id: 'delivered',
      label: 'Delivered',
      count: initialOrders.filter((o) => o.status === 'delivered').length,
    },
    {
      id: 'cancelled',
      label: 'Cancelled',
      count: initialOrders.filter((o) => o.status === 'cancelled').length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards (2x2 on mobile, 4-col on desktop) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-[24px] border border-black/[0.05] dark:border-white/[0.08] bg-white dark:bg-[#1d1d1f] p-4 sm:p-5 soft-shadow">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5f5f7] dark:bg-white/[0.06] text-[#1d1d1f] dark:text-[#f5f5f7]">
              <Package className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                {stats.total}
              </p>
              <p className="text-xs font-medium text-[#6e6e73] dark:text-[#86868b] truncate">
                Inquiries
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-amber-300/60 dark:border-amber-800/50 bg-white dark:bg-[#1d1d1f] p-4 sm:p-5 soft-shadow">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-semibold tracking-tight text-amber-600 dark:text-amber-400 truncate">
                {stats.pending}
              </p>
              <p className="text-xs font-medium text-[#6e6e73] dark:text-[#86868b] truncate">
                Pending WA
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-emerald-300/60 dark:border-emerald-800/50 bg-white dark:bg-[#1d1d1f] p-4 sm:p-5 soft-shadow">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400 truncate">
                {stats.confirmed}
              </p>
              <p className="text-xs font-medium text-[#6e6e73] dark:text-[#86868b] truncate">
                Confirmed
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-black/[0.05] dark:border-white/[0.08] bg-white dark:bg-[#1d1d1f] p-4 sm:p-5 soft-shadow">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5f5f7] dark:bg-white/[0.06] text-[#86868b]">
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-semibold tracking-tight text-[#6e6e73] dark:text-[#86868b] truncate">
                {stats.cancelled}
              </p>
              <p className="text-xs font-medium text-[#86868b] truncate">
                Cancelled
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-[24px] border border-black/[0.05] dark:border-white/[0.08] bg-white dark:bg-[#1d1d1f] p-4 sm:p-5 soft-shadow space-y-4">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-black/[0.06] dark:border-white/[0.08] pb-3.5 overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-colors ${
                statusFilter === tab.id
                  ? 'bg-[#1d1d1f] text-white dark:bg-white dark:text-[#1d1d1f]'
                  : 'bg-[#f5f5f7] dark:bg-white/[0.06] text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  statusFilter === tab.id
                    ? 'bg-white/20 text-white dark:bg-black/15 dark:text-[#1d1d1f]'
                    : 'bg-black/[0.06] dark:bg-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Quick Actions Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order number, customer name, phone, or city..."
              className="w-full rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-[#f5f5f7] dark:bg-white/[0.05] pl-10 pr-4 py-2.5 text-sm text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] outline-none focus:bg-white dark:focus:bg-[#1d1d1f] focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredOrders.length === 0}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#1d1d1f] px-4 py-2.5 text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors disabled:opacity-40"
              title="Export filtered orders to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-semibold tracking-tight text-zinc-950 transition-colors soft-shadow"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Walk-In Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* Orders List / Table */}
      <div className="rounded-[24px] border border-black/[0.05] dark:border-white/[0.08] bg-white dark:bg-[#1d1d1f] soft-shadow overflow-hidden">
        {/* Mobile View: Dedicated Touch Cards (< md) */}
        <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08] md:hidden">
          {filteredOrders.map((order) => {
            const waLink = getWhatsAppLink(order);

            return (
              <div key={order.id} className="p-4 space-y-3.5">
                {/* Header: Order #, Item Count & Status Selector */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-mono text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1.5"
                    >
                      <span>{order.order_number}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#86868b]" />
                    </Link>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#86868b] mt-0.5">
                      <Calendar className="w-3 h-3 text-[#86868b]" />
                      <span>{formatDate(order.created_at)}</span>
                      {order.item_count ? (
                        <>
                          <span>·</span>
                          <span>{order.item_count} {order.item_count === 1 ? 'item' : 'items'}</span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <OrderStatusSelect
                    orderId={order.id}
                    currentStatus={order.status}
                    size="sm"
                  />
                </div>

                {/* Customer Details & Amount Box */}
                <div className="flex items-center justify-between rounded-2xl bg-[#f5f5f7] dark:bg-white/[0.04] p-3.5 border border-black/[0.05] dark:border-white/[0.08]">
                  <div className="min-w-0 pr-2">
                    <p className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                      {order.customer_name}
                    </p>
                    <p className="text-xs text-[#6e6e73] dark:text-[#86868b] truncate">
                      {order.city} · <a href={`tel:${order.phone}`} className="hover:underline">{order.phone}</a>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {formatLKR(order.total)}
                    </p>
                    {order.delivery_fee > 0 ? (
                      <p className="text-[10px] text-[#86868b]">
                        +{formatLKR(order.delivery_fee)} del.
                      </p>
                    ) : (
                      <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Free delivery
                      </p>
                    )}
                  </div>
                </div>

                {/* Mobile Action Buttons Bar */}
                <div className="flex items-center gap-2 flex-wrap pt-0.5">
                  {order.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => setSelectedForCompletion(order)}
                      title="Confirm WhatsApp Sale"
                      className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 py-2 px-3.5 text-xs font-semibold text-white shadow-xs transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Done</span>
                    </button>
                  )}

                  {order.status === 'confirmed' && (
                    <button
                      type="button"
                      onClick={() => setSelectedForCompletion(order)}
                      title="Adjust items"
                      className="flex-1 min-w-[80px] inline-flex items-center justify-center gap-1.5 rounded-full border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 py-2 px-3.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Adjust</span>
                    </button>
                  )}

                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Message customer on WhatsApp"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 py-2 px-3.5 text-xs font-semibold text-white transition-colors shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  {(order.status === 'pending' || order.status === 'confirmed') && (
                    <OrderCancelButton
                      orderId={order.id}
                      orderNumber={order.order_number}
                      currentStatus={order.status}
                      size="sm"
                    />
                  )}

                  <Link
                    href={`/admin/orders/${order.id}`}
                    title="View order details"
                    className="inline-flex items-center justify-center gap-1 rounded-full border border-black/[0.08] dark:border-white/[0.12] py-2 px-3 text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <OrderDeleteButton
                    orderId={order.id}
                    orderNumber={order.order_number}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Full Data Table (visible on md+) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-[#6e6e73] dark:text-[#86868b]">
            <thead className="bg-[#f5f5f7] dark:bg-white/[0.03] text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] border-b border-black/[0.06] dark:border-white/[0.08]">
              <tr>
                <th className="px-6 py-4">Order #</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
              {filteredOrders.map((order) => {
                const waLink = getWhatsAppLink(order);

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Order # */}
                    <td className="px-6 py-4 font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-sm text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1.5"
                      >
                        <span>{order.order_number}</span>
                      </Link>
                      {order.item_count ? (
                        <p className="text-[11px] font-normal text-[#86868b]">
                          {order.item_count} {order.item_count === 1 ? 'item' : 'items'}
                        </p>
                      ) : null}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-[#6e6e73] dark:text-[#86868b]">
                        <Calendar className="w-3.5 h-3.5 text-[#86868b]" />
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                          {order.customer_name}
                        </p>
                        <p className="text-xs text-[#86868b]">
                          {order.city} · {order.phone}
                        </p>
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="px-6 py-4 font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">
                      <p>{formatLKR(order.total)}</p>
                      {order.delivery_fee > 0 ? (
                        <p className="text-[10px] font-normal text-[#86868b]">
                          Incl. {formatLKR(order.delivery_fee)} delivery
                        </p>
                      ) : (
                        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Free Delivery
                        </p>
                      )}
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <OrderStatusSelect
                        orderId={order.id}
                        currentStatus={order.status}
                      />
                    </td>

                    {/* Action Buttons */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {order.status === 'pending' && (
                          <>
                            {/* Done / Confirm Sale button */}
                            <button
                              type="button"
                              onClick={() => setSelectedForCompletion(order)}
                              title="Confirm WhatsApp Sale (Pick purchased items & deduct stock)"
                              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold tracking-tight text-white transition-colors shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Done</span>
                            </button>

                            {/* Cancel Inquiry button (No stock change) */}
                            <OrderCancelButton
                              orderId={order.id}
                              orderNumber={order.order_number}
                              currentStatus={order.status}
                              size="sm"
                            />
                          </>
                        )}

                        {order.status === 'confirmed' && (
                          <>
                            <button
                              type="button"
                              onClick={() => setSelectedForCompletion(order)}
                              title="Adjust items for this confirmed sale"
                              className="inline-flex items-center gap-1 rounded-full border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Adjust</span>
                            </button>

                            <OrderCancelButton
                              orderId={order.id}
                              orderNumber={order.order_number}
                              currentStatus={order.status}
                              size="sm"
                            />
                          </>
                        )}

                        {/* Instant WhatsApp chat button */}
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Message customer on WhatsApp"
                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors shadow-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">WhatsApp</span>
                        </a>

                        {/* View Order Link */}
                        <Link
                          href={`/admin/orders/${order.id}`}
                          title="View order details"
                          className="inline-flex items-center gap-1 rounded-full border border-black/[0.08] dark:border-white/[0.12] px-3 py-1.5 text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">Details</span>
                        </Link>

                        {/* Delete button */}
                        <OrderDeleteButton
                          orderId={order.id}
                          orderNumber={order.order_number}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State (Shared) */}
        {filteredOrders.length === 0 && (
          <div className="px-6 py-12 text-center text-zinc-500">
            <Package className="w-8 h-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
            <p className="font-bold text-sm text-zinc-700 dark:text-zinc-300">
              No orders found
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              {search || statusFilter !== 'all'
                ? 'Try clearing your search or status filter.'
                : 'Orders submitted via the customer checkout will appear here.'}
            </p>
          </div>
        )}
      </div>

      {/* WhatsApp Sale Confirmation Modal */}
      {selectedForCompletion && (
        <OrderCompleteModal
          isOpen={!!selectedForCompletion}
          orderId={selectedForCompletion.id}
          orderNumber={selectedForCompletion.order_number}
          customerName={selectedForCompletion.customer_name}
          deliveryFee={selectedForCompletion.delivery_fee}
          initialNotes={selectedForCompletion.notes}
          onClose={() => setSelectedForCompletion(null)}
          onSuccess={() => setSelectedForCompletion(null)}
        />
      )}

      {/* Manual / Walk-In Order Modal */}
      <ManualOrderModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />
    </div>
  );
}
