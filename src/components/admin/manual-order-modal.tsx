'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Plus,
  Trash2,
  Package,
  Loader2,
  Check,
  AlertTriangle,
  ShoppingBag,
} from 'lucide-react';
import { formatLKR } from '@/data/products';
import {
  createManualOrder,
  getCatalogProductsWithVariants,
} from '@/app/admin/actions';
import type { CatalogProductOption, SaleItemInput } from '@/types/order';

interface ManualOrderItemRow {
  tempId: string;
  productId: string;
  variantId: string;
  productName: string;
  colour: string;
  size: string;
  sizeSystem?: string;
  sizeValue?: string;
  quantity: number;
  unitPrice: number;
  currentStock: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ManualOrderModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogProducts, setCatalogProducts] = useState<CatalogProductOption[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [newQuantity, setNewQuantity] = useState<number>(1);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Colombo');
  const [address, setAddress] = useState('Direct / Walk-in');
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [orderStatus, setOrderStatus] = useState<'confirmed' | 'pending'>('confirmed');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ManualOrderItemRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoadingCatalog(true);
    setError(null);

    async function loadCatalog() {
      try {
        const res = await getCatalogProductsWithVariants();
        if (!isMounted) return;
        if ('error' in res) {
          setError(res.error);
        } else {
          setCatalogProducts(res.products);
          if (res.products.length > 0) {
            setSelectedProductId(res.products[0].id);
            if (res.products[0].product_variants.length > 0) {
              setSelectedVariantId(res.products[0].product_variants[0].id);
            }
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load catalog');
        }
      } finally {
        if (isMounted) setLoadingCatalog(false);
      }
    }

    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!selectedProductId) return;
    const prod = catalogProducts.find((p) => p.id === selectedProductId);
    if (prod && prod.product_variants.length > 0) {
      setSelectedVariantId(prod.product_variants[0].id);
    } else {
      setSelectedVariantId('');
    }
  }, [selectedProductId, catalogProducts]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPending, onClose]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (!selectedProductId || !selectedVariantId) return;
    const product = catalogProducts.find((p) => p.id === selectedProductId);
    if (!product) return;
    const variant = product.product_variants.find((v) => v.id === selectedVariantId);
    if (!variant) return;

    setItems((prev) => {
      const existingIdx = prev.findIndex((it) => it.variantId === variant.id);
      if (existingIdx !== -1) {
        return prev.map((it, idx) =>
          idx === existingIdx
            ? { ...it, quantity: it.quantity + newQuantity }
            : it
        );
      }

      return [
        ...prev,
        {
          tempId: `manual-${Date.now()}-${Math.random()}`,
          productId: product.id,
          variantId: variant.id,
          productName: product.name,
          colour: variant.colour,
          size: String(variant.size_value || variant.size || ''),
          sizeSystem: variant.size_system || 'EU',
          sizeValue: variant.size_value || String(variant.size || ''),
          quantity: newQuantity,
          unitPrice: product.price,
          currentStock: variant.stock,
        },
      ];
    });
    setNewQuantity(1);
  };

  const updateItemQty = (tempId: string, qty: number) => {
    if (qty < 1) return;
    setItems((prev) =>
      prev.map((it) => (it.tempId === tempId ? { ...it, quantity: qty } : it))
    );
  };

  const removeItem = (tempId: string) => {
    setItems((prev) => prev.filter((it) => it.tempId !== tempId));
  };

  const subtotal = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
  const grandTotal = subtotal + Math.max(0, deliveryFee);
  const totalQuantity = items.reduce((sum, it) => sum + it.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim()) {
      setError('Customer name is required.');
      return;
    }
    if (!phone.trim()) {
      setError('Customer phone number is required.');
      return;
    }
    if (items.length === 0) {
      setError('Please add at least one product item to the order.');
      return;
    }

    const payloadItems: SaleItemInput[] = items.map((it) => ({
      productId: it.productId,
      variantId: it.variantId,
      productName: it.productName,
      colour: it.colour,
      size: it.size,
      sizeSystem: it.sizeSystem,
      sizeValue: it.sizeValue,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
    }));

    startTransition(async () => {
      const res = await createManualOrder({
        customerName,
        phone,
        city,
        address,
        deliveryFee,
        status: orderStatus,
        notes,
        items: payloadItems,
      });

      if ('error' in res) {
        setError(res.error);
      } else {
        setCustomerName('');
        setPhone('');
        setItems([]);
        setNotes('');
        onClose();
        router.refresh();
      }
    });
  };

  const selectedProduct = catalogProducts.find((p) => p.id === selectedProductId);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden my-2 sm:my-8 max-h-[94vh] sm:max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white">
                New Walk-In / Direct WhatsApp Order
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Log a direct customer purchase and automatically deduct inventory stock
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {error && (
            <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 p-3.5 text-xs font-medium text-red-600 dark:text-red-400 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Kasun Perera"
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Phone / WhatsApp Number *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0771234567"
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Colombo"
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Delivery Address / Pickup Type
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Direct / Walk-in or street address"
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Add Product Selector */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 p-3.5 space-y-3">
            <p className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-amber-500" />
              <span>Add Products to Order</span>
            </p>

            {loadingCatalog ? (
              <div className="py-4 flex items-center gap-2 text-xs text-zinc-400">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                <span>Loading product catalog...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-1 font-medium">
                      Product
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-xs text-zinc-900 dark:text-white font-medium"
                    >
                      {catalogProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({formatLKR(p.price)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-1 font-medium">
                      Variant (Color & Size)
                    </label>
                    <select
                      value={selectedVariantId}
                      onChange={(e) => setSelectedVariantId(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-xs text-zinc-900 dark:text-white font-medium"
                    >
                      {selectedProduct?.product_variants.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.colour} - {v.size_system || 'EU'} {v.size_value || v.size} ({v.stock} in stock)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2 text-xs">
                    <label className="text-zinc-500 font-medium">Qty:</label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-1.5 text-xs font-mono font-bold text-center text-zinc-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={!selectedVariantId}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 dark:bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-amber-400 transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Items List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">
              <span>Order Items ({items.length})</span>
              <span>{totalQuantity} units</span>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
              {items.map((item) => {
                const isOverStock = item.quantity > item.currentStock;
                return (
                  <div key={item.tempId} className="p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate">
                        {item.productName}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {item.colour} · Size {item.sizeSystem} {item.size} · {formatLKR(item.unitPrice)} ea
                      </p>
                      {isOverStock && (
                        <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                          Only {item.currentStock} in stock
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                        <button
                          type="button"
                          onClick={() => updateItemQty(item.tempId, item.quantity - 1)}
                          className="px-2 py-1 text-xs font-bold text-zinc-600 dark:text-zinc-300"
                        >
                          -
                        </button>
                        <span className="px-2 py-1 text-xs font-mono font-bold text-zinc-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateItemQty(item.tempId, item.quantity + 1)}
                          className="px-2 py-1 text-xs font-bold text-zinc-600 dark:text-zinc-300"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white min-w-[75px] text-right">
                        {formatLKR(item.quantity * item.unitPrice)}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeItem(item.tempId)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {items.length === 0 && (
                <div className="p-6 text-center text-xs text-zinc-400">
                  No items added yet. Select a product above and click &ldquo;Add Item&rdquo;.
                </div>
              )}
            </div>
          </div>

          {/* Delivery Fee, Status & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Delivery Fee (LKR)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-mono font-bold text-zinc-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setDeliveryFee(0)}
                  className="px-2.5 py-2 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Free
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Initial Order Status
              </label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value as 'confirmed' | 'pending')}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-900 dark:text-white"
              >
                <option value="confirmed">Confirmed (Deduct Stock Now)</option>
                <option value="pending">Pending Inquiry (No Stock Deducted)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Walk-in cash sale"
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          {/* Total Banner */}
          <div className="rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60 p-3.5 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
              Order Grand Total:
            </span>
            <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
              {formatLKR(grandTotal)}
            </span>
          </div>

          {/* Submit Footer */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || items.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Order...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Create Order</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
