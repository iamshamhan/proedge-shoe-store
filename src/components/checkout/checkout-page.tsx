'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Truck,
  MessageSquare,
  CheckCircle2,
  User,
  Phone,
  MapPin,
  StickyNote,
} from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useStoreSettings } from '@/context/settings-context';
import { formatLKR } from '@/data/products';
import { getDeliveryFee } from '@/lib/config';
import { generateWhatsAppOrderLink } from '@/lib/whatsapp';
import { placeOrder } from '@/app/checkout/actions';
import type { ValidatedOrder } from '@/types/order';

interface CheckoutFormState {
  fullName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
}

const INITIAL_FORM: CheckoutFormState = {
  fullName: '',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
  notes: '',
};

type FormErrors = Partial<Record<keyof CheckoutFormState, string>>;

const inputClasses =
  'w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-amber-500 transition-all';

export function CheckoutPage() {
  const { items, subtotal } = useCart();
  const settings = useStoreSettings();

  const [form, setForm] = useState<CheckoutFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderUrl, setOrderUrl] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<ValidatedOrder | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const deliveryFee = getDeliveryFee(subtotal, settings);
  const total = subtotal + deliveryFee;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!form.phone.trim()) {
      nextErrors.phone = 'Phone number is required.';
    } else if (!/^0[0-9]{9}$/.test(form.phone.trim())) {
      nextErrors.phone = 'Enter a valid Sri Lankan phone number (e.g. 0771234567).';
    }
    if (form.whatsapp.trim() && !/^0[0-9]{9}$/.test(form.whatsapp.trim())) {
      nextErrors.whatsapp = 'Enter a valid Sri Lankan WhatsApp number (e.g. 0771234567).';
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!form.address.trim()) nextErrors.address = 'Delivery address is required.';
    if (!form.city.trim()) nextErrors.city = 'City is required.';

    return nextErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prevent duplicate accidental submissions.
    if (isSubmitting || orderData) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    // The client sends only identifiers + quantities + delivery details.
    // Prices, names, subtotals and totals are calculated by the server.
    const result = await placeOrder(
      {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim(),
        city: form.city.trim(),
        postalCode: form.postalCode.trim() || undefined,
        notes: form.notes.trim() || undefined,
      },
      items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        size: item.size,
        sizeSystem: item.sizeSystem,
        color: item.color,
        quantity: item.quantity,
      })),
    );

    if (!result.success) {
      setSubmitError(result.error);
      setIsSubmitting(false);
      return;
    }

    const order = result.order;

    // Build the WhatsApp message ONLY from server-validated order data.
    const url = generateWhatsAppOrderLink({
      orderNumber: order.order_number,
      customer: {
        fullName: order.customer.fullName,
        phone: order.customer.phone,
        whatsapp: order.customer.whatsapp,
        email: order.customer.email,
        address: order.customer.address,
        city: order.customer.city,
        postalCode: order.customer.postalCode,
        notes: order.customer.notes,
      },
      items: order.items.map((i) => ({
        name: i.name,
        size: i.size_value || i.size,
        sizeSystem: i.size_system,
        color: i.colour,
        quantity: i.quantity,
        price: i.unit_price,
      })),
      subtotal: order.subtotal,
      deliveryFee: order.delivery_fee,
      total: order.total,
    });

    window.open(url, '_blank', 'noopener,noreferrer');
    setOrderUrl(url);
    setOrderData(order);
    setIsSubmitting(false);
  };

  if (items.length === 0 && !orderUrl) {
    return (
      <div className="py-16 sm:py-24 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 sm:p-16 shadow-xs">
            <div className="w-20 h-20 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 mb-6">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
              Your cart is empty
            </h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400 text-sm sm:text-base">
              Add footwear to your cart before proceeding to checkout.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-zinc-950 transition-all shadow-md"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Post-submit confirmation state (all values server-validated)
  if (orderData && orderUrl) {
    return (
      <div className="py-16 sm:py-24 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 sm:p-14 shadow-xs">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
              Order Ready for WhatsApp
            </h1>
            <p className="mt-3 text-zinc-500 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
              Your order <span className="font-black text-zinc-900 dark:text-white">#{orderData.order_number}</span>{' '}
              was placed successfully and WhatsApp should have opened with a pre-filled
              message. If it did not open, use the button below. Your order is confirmed
              once you press <span className="font-bold text-zinc-800 dark:text-zinc-200">Send</span> in WhatsApp.
            </p>

            <div className="mt-8 rounded-2xl bg-zinc-900 dark:bg-zinc-950 border dark:border-zinc-800 text-white p-6 text-left space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Order Number</span>
                <span className="font-black text-amber-400">{orderData.order_number}</span>
              </div>
              <div className="border-t border-zinc-700 dark:border-zinc-800 pt-3 space-y-2">
                {orderData.items.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-3">
                    <span className="text-zinc-300">
                      {item.name}
                      <span className="block text-xs text-zinc-500">
                        {item.size_system && item.size_system !== 'Custom' ? `${item.size_system} ${item.size}` : item.size} • {item.colour} • Qty {item.quantity}
                      </span>
                    </span>
                    <span className="font-bold">{formatLKR(item.line_total)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-zinc-400">Subtotal</span>
                <span className="font-bold">{formatLKR(orderData.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Delivery</span>
                <span className="font-bold">
                  {orderData.delivery_fee === 0 ? 'FREE' : formatLKR(orderData.delivery_fee)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-zinc-700 dark:border-zinc-800">
                <span className="text-zinc-400">Total</span>
                <span className="font-black text-amber-400">{formatLKR(orderData.total)}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={orderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-emerald-500 transition-all shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open WhatsApp Again</span>
              </a>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all"
              >
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-16 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-8">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest block mb-1">
            PROEDGE Checkout
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
            Checkout
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400 text-sm sm:text-base">
            Enter your delivery details. Your order will be sent to us via WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Delivery Details Form */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-6" noValidate>
              {/* Contact Info */}
              <fieldset className="space-y-4">
                <legend className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white pb-2">
                  <User className="w-4 h-4 text-amber-500" />
                  Contact Details
                </legend>

                <div>
                  <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Kasun Perera"
                    className={inputClasses}
                  />
                  {errors.fullName && (
                    <p className="mt-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">{errors.fullName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        inputMode="numeric"
                        value={form.phone}
                        onChange={handleInputChange}
                        placeholder="0771234567"
                        className={`${inputClasses} pl-10`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="whatsapp" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      WhatsApp Number <span className="text-zinc-400 dark:text-zinc-500 font-medium normal-case">(optional)</span>
                    </label>
                    <input
                      id="whatsapp"
                      name="whatsapp"
                      type="tel"
                      inputMode="numeric"
                      value={form.whatsapp}
                      onChange={handleInputChange}
                      placeholder="Same as phone if blank"
                      className={inputClasses}
                    />
                    {errors.whatsapp && (
                      <p className="mt-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">{errors.whatsapp}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Email <span className="text-zinc-400 dark:text-zinc-500 font-medium normal-case">(optional)</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className={inputClasses}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">{errors.email}</p>
                  )}
                </div>
              </fieldset>

              {/* Delivery Info */}
              <fieldset className="space-y-4 pt-2">
                <legend className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white pb-2">
                  <Truck className="w-4 h-4 text-amber-500" />
                  Delivery Address
                </legend>

                <div>
                  <label htmlFor="address" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      value={form.address}
                      onChange={handleInputChange}
                      placeholder="House number, street, area"
                      className={`${inputClasses} pl-10 resize-none`}
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={form.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Colombo"
                      className={inputClasses}
                    />
                    {errors.city && (
                      <p className="mt-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="postalCode" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Postal Code <span className="text-zinc-400 dark:text-zinc-500 font-medium normal-case">(optional)</span>
                    </label>
                    <input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      inputMode="numeric"
                      value={form.postalCode}
                      onChange={handleInputChange}
                      placeholder="e.g. 00300"
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Order Notes <span className="text-zinc-400 dark:text-zinc-500 font-medium normal-case">(optional)</span>
                  </label>
                  <div className="relative">
                    <StickyNote className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      value={form.notes}
                      onChange={handleInputChange}
                      placeholder="e.g. Please call before delivery."
                      className={`${inputClasses} pl-10 resize-none`}
                    />
                  </div>
                </div>
              </fieldset>

              {submitError && (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-sm font-bold text-rose-700 dark:text-rose-300"
                >
                  {submitError}
                </div>
              )}

              <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <Link
                  href="/cart"
                  className="inline-flex items-center justify-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Cart</span>
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 bg-emerald-600 text-white font-black text-sm uppercase tracking-wider rounded-xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>{isSubmitting ? 'Preparing Order...' : 'Place Order via WhatsApp'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs lg:sticky lg:top-28 space-y-4">
              <h2 className="text-lg font-black uppercase tracking-wider text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-4">
                Order Summary ({items.length})
              </h2>

              {/* Line Items */}
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 overflow-hidden shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-cover object-center"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{item.name}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {item.sizeSystem && item.sizeSystem !== 'Custom' ? `${item.sizeSystem} ${item.size}` : item.size} • {item.color} • Qty {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-zinc-900 dark:text-white shrink-0">
                      {formatLKR(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium">Subtotal</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{formatLKR(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium">Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
                  ) : (
                    <span className="font-bold text-zinc-900 dark:text-white">{formatLKR(deliveryFee)}</span>
                  )}
                </div>
              </div>

              {settings.freeDeliveryEnabled && deliveryFee > 0 && (
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-4 py-3 text-xs text-amber-900 dark:text-amber-300 font-medium">
                  Add {formatLKR(settings.freeDeliveryThreshold - subtotal)} more to unlock
                  free islandwide delivery.
                </div>
              )}

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Total
                </span>
                <span className="text-2xl font-black text-zinc-900 dark:text-white">{formatLKR(total)}</span>
              </div>

              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Pay <span className="font-bold text-zinc-800 dark:text-zinc-200">on delivery</span> when your
                order arrives. No online payment is required for this order.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}