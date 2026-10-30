'use client';

import React, { useRef, useState } from 'react';
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
import { formatLKR } from '@/lib/currency';
import { getDeliveryFee } from '@/lib/config';
import { generateWhatsAppOrderLink } from '@/lib/whatsapp';
import { useCartAvailability } from '@/components/cart/use-cart-availability';
import { checkCart } from '@/app/checkout/cart-actions';
import { cartFingerprint, checkoutRequest, CHECKOUT_REQUEST_KEY } from '@/lib/cart';
import { placeOrder } from '@/app/checkout/actions';
import type { ValidatedOrder } from '@/types/order';
import { Turnstile } from './turnstile';

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
  'w-full px-4 py-3.5 bg-[#f5f5f7] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.12] rounded-2xl text-base sm:text-sm text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] focus:bg-white dark:focus:bg-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all';

export function CheckoutPage() {
  const { items, subtotal, clearCart, replaceItems } = useCart();
  const settings = useStoreSettings();
  const availability = useCartAvailability(items);

  const [form, setForm] = useState<CheckoutFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [challengeVersion, setChallengeVersion] = useState(0);
  const [orderUrl, setOrderUrl] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<ValidatedOrder | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submission = useRef<{ fingerprint: string; id: string } | null>(null);
  const submitting = useRef(false);

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
    if (!turnstileToken) { setSubmitError('Please complete the security check.'); return; }

    // Prevent duplicate accidental submissions.
    if (submitting.current || orderData || availability.checking || availability.error) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!settings.whatsappNumber?.trim()) { setSubmitError('WhatsApp checkout is currently unavailable. Please contact the store.'); return; }
    submitting.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    // The client sends only identifiers + quantities + delivery details.
    // Prices, names, subtotals and totals are calculated by the server.
    try {
      const checked = await checkCart(items);
      if (checked.error) { setSubmitError(checked.error); return; }
      if (!checked.items) return;
      if (checked.items.some((item, index) => item.price !== items[index].price)) {
        replaceItems(checked.items);
        setSubmitError('Prices have changed. Review the updated total, then submit again.');
        return;
      }
      const fingerprint = cartFingerprint(items);
      submission.current = checkoutRequest(sessionStorage, fingerprint);
      const result = await placeOrder(
        {
          requestId: submission.current.id,
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
        turnstileToken,
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
        storePhone: settings.whatsappNumber,
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
      try { sessionStorage.removeItem(CHECKOUT_REQUEST_KEY); } catch { /* Receipt is already saved. */ }
      submission.current = null;
      clearCart();
    } catch {
      setSubmitError('The connection was interrupted. Try again; the same request will not create a duplicate order.');
    } finally {
      setTurnstileToken('');
      setChallengeVersion(version => version + 1);
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !orderUrl) {
    return (
      <div className="py-16 sm:py-24 bg-[#f5f5f7] dark:bg-[#000000] min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white dark:bg-[#1d1d1f] border border-black/[0.05] dark:border-white/[0.08] rounded-[32px] p-10 sm:p-16 soft-shadow">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#f5f5f7] dark:bg-white/[0.06] flex items-center justify-center text-[#86868b] mb-6">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-semibold tracking-[-0.025em] text-[#1d1d1f] dark:text-[#f5f5f7]">
              Your bag is empty.
            </h1>
            <p className="mt-2 text-[#6e6e73] dark:text-[#86868b] text-sm sm:text-base">
              Add footwear to your bag before proceeding to checkout.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] font-semibold text-sm tracking-tight rounded-full hover:bg-amber-500 dark:hover:bg-amber-400 hover:text-zinc-950 transition-all soft-shadow"
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
      <div className="py-16 sm:py-24 bg-[#f5f5f7] dark:bg-[#000000] min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white dark:bg-[#1d1d1f] border border-black/[0.05] dark:border-white/[0.08] rounded-[32px] p-10 sm:p-14 soft-shadow">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-semibold tracking-[-0.025em] text-[#1d1d1f] dark:text-[#f5f5f7]">
              Order ready for WhatsApp.
            </h1>
            <p className="mt-3 text-[#6e6e73] dark:text-[#86868b] text-sm sm:text-base leading-relaxed">
              Your order <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">#{orderData.order_number}</span>{' '}
              was placed successfully and WhatsApp should have opened with a pre-filled
              message. If it did not open, use the button below. Press <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Send</span> in WhatsApp to contact us. Your inquiry is confirmed only after the store checks availability and agrees the sale.
            </p>

            <div className="mt-8 rounded-[24px] bg-[#1d1d1f] dark:bg-black border border-white/[0.08] text-[#f5f5f7] p-6 text-left space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#86868b]">Order Number</span>
                <span className="font-semibold text-amber-400">{orderData.order_number}</span>
              </div>
              <div className="border-t border-white/[0.08] pt-3 space-y-2">
                {orderData.items.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-3">
                    <span className="text-[#f5f5f7]">
                      {item.name}
                      <span className="block text-xs text-[#86868b]">
                        {item.size_system && item.size_system !== 'Custom' ? `${item.size_system} ${item.size}` : item.size} • {item.colour} • Qty {item.quantity}
                      </span>
                    </span>
                    <span className="font-semibold">{formatLKR(item.line_total)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-[#86868b]">Subtotal</span>
                <span className="font-semibold">{formatLKR(orderData.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#86868b]">Delivery</span>
                <span className="font-semibold">
                  {orderData.delivery_fee === 0 ? 'FREE' : formatLKR(orderData.delivery_fee)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                <span className="text-[#86868b]">Total</span>
                <span className="font-semibold text-amber-400">{formatLKR(orderData.total)}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={orderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 text-white font-semibold text-sm tracking-tight rounded-full hover:bg-emerald-500 transition-all soft-shadow"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open WhatsApp Again</span>
              </a>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#f5f5f7] dark:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.12] text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold text-sm tracking-tight rounded-full hover:bg-black/[0.06] dark:hover:bg-white/[0.14] transition-all"
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
    <div className="py-10 sm:py-16 bg-[#f5f5f7] dark:bg-[#000000] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 border-b border-black/[0.06] dark:border-white/[0.08] pb-8">
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 block mb-1.5">
            PROEDGE Checkout
          </span>
          <h1 className="text-3xl sm:text-5xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.025em]">
            Checkout.
          </h1>
          <p className="mt-2 text-[#6e6e73] dark:text-[#86868b] text-sm sm:text-base">
            Enter your delivery details. Your order will be sent to us via WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Delivery Details Form */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1d1d1f] rounded-[32px] border border-black/[0.05] dark:border-white/[0.08] p-6 sm:p-8 soft-shadow space-y-6" noValidate>
              {/* Contact Info */}
              <fieldset className="space-y-4">
                <legend className="flex items-center gap-2 text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] pb-2">
                  <User className="w-4 h-4 text-amber-500" />
                  Contact Details
                </legend>

                <div>
                  <label htmlFor="fullName" className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
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
                    <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.fullName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-4 w-4 h-4 text-[#86868b]" />
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
                      <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="whatsapp" className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
                      WhatsApp Number <span className="text-[#86868b] font-normal">(optional)</span>
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
                      <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.whatsapp}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
                    Email <span className="text-[#86868b] font-normal">(optional)</span>
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
                    <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.email}</p>
                  )}
                </div>
              </fieldset>

              {/* Delivery Info */}
              <fieldset className="space-y-4 pt-2">
                <legend className="flex items-center gap-2 text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] pb-2">
                  <Truck className="w-4 h-4 text-amber-500" />
                  Delivery Address
                </legend>

                <div>
                  <label htmlFor="address" className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
                    Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-4 w-4 h-4 text-[#86868b]" />
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
                    <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
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
                      <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="postalCode" className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
                      Postal Code <span className="text-[#86868b] font-normal">(optional)</span>
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
                  <label htmlFor="notes" className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
                    Order Notes <span className="text-[#86868b] font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <StickyNote className="absolute left-3.5 top-4 w-4 h-4 text-[#86868b]" />
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

              {availability.checking && <p role="status">Checking current availability...</p>}
              {availability.error && <div role="alert" className="text-sm text-rose-600">
                {availability.error} <Link href="/cart" className="underline">Edit bag</Link>{' '}
                <button type="button" onClick={availability.retry} className="underline">Check again</button>
              </div>}
              {submitError && (
                <div
                  role="alert"
                  className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-300"
                >
                  {submitError}
                </div>
              )}

              <Turnstile key={challengeVersion} onToken={setTurnstileToken} />
              <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <Link
                  href="/cart"
                  className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Bag</span>
                </Link>

                <button
                  type="submit"
                  disabled={!turnstileToken || isSubmitting || availability.checking || Boolean(availability.error)}
                  className="px-8 py-4 bg-emerald-600 text-white font-semibold text-[15px] tracking-tight rounded-full hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 soft-shadow disabled:opacity-60"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>{isSubmitting ? 'Preparing Order...' : 'Place Order via WhatsApp'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-[#1d1d1f] rounded-[32px] border border-black/[0.05] dark:border-white/[0.08] p-6 sm:p-7 soft-shadow lg:sticky lg:top-28 space-y-5">
              <h2 className="text-xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
                Order Summary ({items.length})
              </h2>

              {/* Line Items */}
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-xl bg-[#f5f5f7] dark:bg-white/[0.05] border border-black/[0.05] dark:border-white/[0.08] overflow-hidden shrink-0" style={{ position: 'relative' }}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-cover object-center"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] truncate">{item.name}</p>
                      <p className="text-xs text-[#6e6e73] dark:text-[#86868b]">
                        {item.sizeSystem && item.sizeSystem !== 'Custom' ? `${item.sizeSystem} ${item.size}` : item.size} • {item.color} • Qty {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] shrink-0">
                      {formatLKR(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08] space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#6e6e73] dark:text-[#86868b]">Subtotal</span>
                  <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{formatLKR(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6e6e73] dark:text-[#86868b]">Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">FREE</span>
                  ) : (
                    <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{formatLKR(deliveryFee)}</span>
                  )}
                </div>
              </div>

              {settings.freeDeliveryEnabled && deliveryFee > 0 && (
                <div className="rounded-2xl bg-[#f5f5f7] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.08] px-4 py-3 text-xs text-[#6e6e73] dark:text-[#86868b]">
                  Add <strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">{formatLKR(settings.freeDeliveryThreshold - subtotal)}</strong> more to unlock
                  free islandwide delivery.
                </div>
              )}

              <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
                <span className="text-sm font-medium text-[#6e6e73] dark:text-[#86868b]">
                  Total
                </span>
                <span className="text-2xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">{formatLKR(total)}</span>
              </div>

              <div className="rounded-2xl bg-[#f5f5f7] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.08] px-4 py-3 text-xs text-[#6e6e73] dark:text-[#86868b] leading-relaxed">
                Pay <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">on delivery</span> when your
                order arrives. No online payment is required for this order.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


