'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  MessageCircle,
  ExternalLink,
  Calendar,
  DollarSign,
  Package,
  Clock,
} from 'lucide-react';
import { formatLKR } from '@/data/products';
import { OrderStatusSelect } from './order-status-select';
import { OrderDeleteButton } from './order-delete-button';

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
      ['confirmed', 'processing', 'ready_to_ship'].includes(o.status)
    ).length;
    const revenue = initialOrders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    return { total, pending, confirmed, revenue };
  }, [initialOrders]);

  const getWhatsAppLink = (phone: string, orderNumber: string, customerName: string) => {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.length === 10 && clean.startsWith('0')) {
      clean = '94' + clean.substring(1);
    }
    const message = encodeURIComponent(
      `Hello ${customerName}! This is PROEDGE regarding your order #${orderNumber}.`
    );
    return `https://wa.me/${clean}?text=${message}`;
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
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-zinc-900 dark:text-white">
                {stats.total}
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Total Orders
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {stats.pending}
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Pending WhatsApp
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-zinc-900 dark:text-white">
                {stats.confirmed}
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                In Progress
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {formatLKR(stats.revenue)}
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Active Volume
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm space-y-4">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3 overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                statusFilter === tab.id
                  ? 'bg-zinc-900 text-white dark:bg-amber-500 dark:text-zinc-950'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  statusFilter === tab.id
                    ? 'bg-white/20 text-white dark:bg-zinc-950/20 dark:text-zinc-950'
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number, customer name, phone, or city..."
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Orders List / Table */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4">Order #</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredOrders.map((order) => {
                const waLink = getWhatsAppLink(
                  order.phone,
                  order.order_number,
                  order.customer_name
                );

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    {/* Order # */}
                    <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-sm text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1.5"
                      >
                        <span>{order.order_number}</span>
                      </Link>
                      {order.item_count ? (
                        <p className="text-[11px] font-normal text-zinc-400">
                          {order.item_count} {order.item_count === 1 ? 'item' : 'items'}
                        </p>
                      ) : null}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-zinc-500">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-white">
                          {order.customer_name}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {order.city} · {order.phone}
                        </p>
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white whitespace-nowrap">
                      <p>{formatLKR(order.total)}</p>
                      {order.delivery_fee > 0 ? (
                        <p className="text-[10px] font-normal text-zinc-400">
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
                        {/* Instant WhatsApp chat button */}
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Message on WhatsApp"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white transition-colors shadow-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </a>

                        {/* View Order Link */}
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 px-2.5 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Details</span>
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

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    <Package className="w-8 h-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
                    <p className="font-bold text-sm text-zinc-700 dark:text-zinc-300">
                      No orders found
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {search || statusFilter !== 'all'
                        ? 'Try clearing your search or status filter.'
                        : 'Orders submitted via the customer checkout will appear here.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
