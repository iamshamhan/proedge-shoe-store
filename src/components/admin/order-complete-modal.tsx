'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Package,
  Loader2,
  Check,
} from 'lucide-react';
import { formatLKR } from '@/data/products';
import {
  confirmOrderSale,
  getOrderItemsWithStock,
  getCatalogProductsWithVariants,
} from '@/app/admin/actions';
import type {
  CatalogProductOption,
  OrderItemWithStock,
  SaleItemInput,
} from '@/types/order';

interface OrderItemRowState {
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
  selected: boolean;
  isNew?: boolean;
}

interface Props {
  orderId: string;
  orderNumber: string;
  customerName: string;
  deliveryFee: number;
  initialNotes?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function OrderCompleteModal({
  orderId,
  orderNumber,
  customerName,
  deliveryFee: initialDeliveryFee,
  initialNotes = '',
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [loadingItems, setLoadingItems] = useState(true);
  const [revision, setRevision] = useState<number | null>(null);
  const [items, setItems] = useState<OrderItemRowState[]>([]);
  const [deliveryFee, setDeliveryFee] = useState(initialDeliveryFee);
  const [adminNotes, setAdminNotes] = useState(initialNotes || '');
  const [error, setError] = useState<string | null>(null);

  // Catalog state for adding extra items
  const [showAddForm, setShowAddForm] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<CatalogProductOption[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [newQuantity, setNewQuantity] = useState<number>(1);

  // Load items with current stock when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoadingItems(true);
    setRevision(null);
    setItems([]);
    setError(null);
    setDeliveryFee(initialDeliveryFee);
    setAdminNotes(initialNotes || '');

    async function loadData() {
      try {
        const [itemsRes, catalogRes] = await Promise.all([
          getOrderItemsWithStock(orderId),
          getCatalogProductsWithVariants(),
        ]);

        if (!isMounted) return;

        if ('error' in itemsRes) {
          setError(itemsRes.error);
        } else {
          setRevision(itemsRes.revision);
          setDeliveryFee(itemsRes.deliveryFee);
          setAdminNotes(itemsRes.notes || '');
          setItems(
            itemsRes.items.map((it: OrderItemWithStock) => ({
              tempId: it.id,
              productId: it.product_id,
              variantId: it.variant_id ?? '',
              productName: it.product_name,
              colour: it.colour,
              size: it.size,
              sizeSystem: it.size_system,
              sizeValue: it.size_value,
              quantity: it.quantity,
              unitPrice: it.unit_price,
              currentStock: it.current_stock ?? 0,
              selected: true,
            }))
          );
        }

        if (!('error' in catalogRes)) {
          setCatalogProducts(catalogRes.products);
          if (catalogRes.products.length > 0) {
            setSelectedProductId(catalogRes.products[0].id);
            if (catalogRes.products[0].product_variants.length > 0) {
              setSelectedVariantId(catalogRes.products[0].product_variants[0].id);
            }
          }
        }
      } catch (err: unknown) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Failed to load order items');
      } finally {
        if (isMounted) setLoadingItems(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, orderId, initialDeliveryFee, initialNotes]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPending, onClose]);

  // When selected product changes in "Add Item" form, update selected variant
  useEffect(() => {
    if (!selectedProductId) return;
    const prod = catalogProducts.find((p) => p.id === selectedProductId);
    if (prod && prod.product_variants.length > 0) {
      setSelectedVariantId(prod.product_variants[0].id);
    } else {
      setSelectedVariantId('');
    }
  }, [selectedProductId, catalogProducts]);

  if (!isOpen) return null;

  const toggleSelect = (tempId: string) => {
    setItems((prev) =>
      prev.map((it) => (it.tempId === tempId ? { ...it, selected: !it.selected } : it))
    );
  };

  const updateQuantity = (tempId: string, qty: number) => {
    if (qty < 1) return;
    setItems((prev) =>
      prev.map((it) => (it.tempId === tempId ? { ...it, quantity: qty } : it))
    );
  };

  const handleAddNewItem = () => {
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
            ? {
                ...it,
                quantity: it.quantity + newQuantity,
                selected: true,
              }
            : it
        );
      }

      const newItem: OrderItemRowState = {
        tempId: `new-${Date.now()}-${Math.random()}`,
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
        selected: true,
        isNew: true,
      };
      return [...prev, newItem];
    });
    setShowAddForm(false);
    setNewQuantity(1);
  };

  const removeRow = (tempId: string) => {
    setItems((prev) => prev.filter((it) => it.tempId !== tempId));
  };

  // Calculations
  const selectedItems = items.filter((it) => it.selected);
  const totalQuantity = selectedItems.reduce((acc, it) => acc + it.quantity, 0);
  const subtotal = selectedItems.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0);
  const grandTotal = subtotal + Math.max(0, deliveryFee);

  const hasInsufficientStock = selectedItems.some(
    (it) => it.quantity > it.currentStock
  );

  const handleConfirmSale = () => {
    setError(null);
    if (revision === null) return;
    if (selectedItems.length === 0) {
      setError('Please select at least one item that was actually purchased.');
      return;
    }

    const payload: SaleItemInput[] = selectedItems.map((it) => ({
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
      const res = await confirmOrderSale(
        orderId,
        payload,
        deliveryFee,
        adminNotes,
        revision
      );

      if ('error' in res) {
        setError(res.error);
      } else {
        onClose();
        if (onSuccess) onSuccess();
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
      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden my-2 sm:my-8 max-h-[94vh] sm:max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white">
                  Confirm WhatsApp Sale
                </h2>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {orderNumber}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Customer: <strong className="text-zinc-700 dark:text-zinc-300">{customerName}</strong>
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

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Explainer Notice */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/40 p-3 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Tick the items the customer agreed to buy. Stock will only be deducted for checked items upon saving.
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 p-3.5 text-xs font-medium text-red-600 dark:text-red-400 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {loadingItems ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              <p className="text-xs font-medium">Checking live inventory stock...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Items List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">
                  <span>Ordered Items</span>
                  <span>{selectedItems.length} of {items.length} purchased</span>
                </div>

                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
                  {items.map((item) => {
                    const isOutOfStock = item.currentStock <= 0;
                    const isOverStock = item.quantity > item.currentStock;

                    return (
                      <div
                        key={item.tempId}
                        className={`p-3.5 transition-colors ${
                          !item.selected
                            ? 'bg-zinc-50/50 dark:bg-zinc-950/40 opacity-50'
                            : 'hover:bg-zinc-50/40 dark:hover:bg-zinc-800/20'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <button
                            type="button"
                            onClick={() => toggleSelect(item.tempId)}
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                              item.selected
                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
                            }`}
                          >
                            {item.selected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </button>

                          {/* Item Info */}
                          <div className="flex-1 min-w-0">
                            {/* Product Title & Line Total */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 pr-1">
                                <p className={`text-sm font-bold leading-snug ${
                                  item.selected
                                    ? 'text-zinc-900 dark:text-white'
                                    : 'text-zinc-400 line-through'
                                }`}>
                                  {item.productName}
                                </p>
                                {item.isNew && (
                                  <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                                    Added via WhatsApp
                                  </span>
                                )}
                              </div>

                              <span className="text-sm font-black text-zinc-900 dark:text-white shrink-0">
                                {formatLKR(item.quantity * item.unitPrice)}
                              </span>
                            </div>

                            {/* Color, Size & Unit Price */}
                            <div className="flex items-center gap-1.5 sm:gap-2 mt-1 text-xs text-zinc-500 flex-wrap">
                              <span>Color: <strong>{item.colour}</strong></span>
                              <span>·</span>
                              <span>Size: <strong className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">{item.size}</strong></span>
                              <span>·</span>
                              <span>{formatLKR(item.unitPrice)} ea</span>
                            </div>

                            {/* Stock Indicator */}
                            <div className="mt-1 flex items-center gap-2">
                              {isOutOfStock ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                  Out of stock (0 left)
                                </span>
                              ) : isOverStock ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                                  <AlertTriangle className="w-3 h-3" />
                                  Only {item.currentStock} in stock (selected {item.quantity})
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  {item.currentStock} in stock
                                </span>
                              )}
                            </div>

                            {/* Quantity Controls & Remove Action Bar */}
                            <div className="mt-2.5 flex items-center justify-between pt-1.5 border-t border-zinc-100 dark:border-zinc-800/60">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-zinc-500 font-medium">Qty:</span>
                                {item.selected ? (
                                  <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(item.tempId, item.quantity - 1)}
                                      disabled={item.quantity <= 1}
                                      className="px-2.5 py-1 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-l disabled:opacity-30"
                                    >
                                      -
                                    </button>
                                    <span className="px-2.5 py-1 text-xs font-mono font-bold text-zinc-900 dark:text-white min-w-[20px] text-center">
                                      {item.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(item.tempId, item.quantity + 1)}
                                      className="px-2.5 py-1 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-r"
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-zinc-400 italic">
                                    Excluded
                                  </span>
                                )}
                              </div>

                              {item.isNew && (
                                <button
                                  type="button"
                                  onClick={() => removeRow(item.tempId)}
                                  className="text-zinc-400 hover:text-red-500 py-1 px-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 text-xs inline-flex items-center gap-1 transition-colors"
                                  title="Remove added item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span className="text-[11px]">Remove</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {items.length === 0 && (
                    <div className="p-8 text-center text-xs text-zinc-400">
                      No items attached to this order.
                    </div>
                  )}
                </div>
              </div>

              {/* Add Extra Item from Catalog */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 bg-zinc-50/50 dark:bg-zinc-900/40">
                {!showAddForm ? (
                  <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Another Item (Customer added during WhatsApp chat)</span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-amber-500" />
                        <span>Select Product from Catalog</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      {/* Product Dropdown */}
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

                      {/* Variant Dropdown */}
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
                              {v.colour} - Size {v.size_value || v.size} ({v.stock} in stock)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2 text-xs">
                        <label className="text-zinc-500 font-medium">Quantity:</label>
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
                        onClick={handleAddNewItem}
                        disabled={!selectedVariantId}
                        className="rounded-lg bg-zinc-900 dark:bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-amber-400 transition-colors disabled:opacity-50"
                      >
                        Add to Sale
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Fee & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Delivery Fee (LKR)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-sm font-mono font-bold text-zinc-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setDeliveryFee(0)}
                      className={`px-2.5 py-2 text-xs font-bold rounded-xl border transition-colors shrink-0 ${
                        deliveryFee === 0
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      Free
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Admin / WhatsApp Notes
                  </label>
                  <input
                    type="text"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="e.g. Paid via Commercial Bank transfer"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-xs text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Grand Total Calculation Card */}
              <div className="rounded-xl bg-zinc-100/70 dark:bg-zinc-800/60 p-4 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Subtotal ({totalQuantity} items):</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {formatLKR(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Delivery Fee:</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {deliveryFee > 0 ? formatLKR(deliveryFee) : 'Free'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-zinc-900 dark:text-white border-t border-zinc-200 dark:border-zinc-700 pt-2 mt-1">
                  <span>Final Sale Total:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono text-base">
                    {formatLKR(grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="w-full sm:w-auto text-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmSale}
            disabled={isPending || loadingItems || revision === null || selectedItems.length === 0 || hasInsufficientStock}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50 shadow-xs"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deducting Stock & Confirming...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Confirm Sale & Deduct Stock</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
