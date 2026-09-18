'use client';

import { useCallback, useState } from 'react';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import {
  addProductVariant,
  removeProductVariant,
  updateVariantStock,
} from '@/app/admin/actions';
import { ConfirmDialog } from './confirm-dialog';

type Variant = {
  id: string;
  colour: string;
  size: number | string;
  stock: number;
  size_system?: string;
  size_value?: string;
};

type VariantManagerProps = {
  productId: string;
  variants: Variant[];
};

export function VariantManager({ productId, variants: initialVariants }: VariantManagerProps) {
  const [variants, setVariants] = useState(initialVariants);
  const [colour, setColour] = useState('');
  const [sizeSystem, setSizeSystem] = useState('EU');
  const [size, setSize] = useState('');
  const [stock, setStock] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [targetDelete, setTargetDelete] = useState<Variant | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleAdd = useCallback(
    async () => {
      setError(null);

      const sValue = size.trim();
      const stockNum = Number(stock);

      if (!colour.trim()) {
        setError('Colour is required.');
        return;
      }
      if (!sValue) {
        setError('Size is required.');
        return;
      }
      if (!Number.isInteger(stockNum) || stockNum < 0) {
        setError('Stock must be a non-negative whole number.');
        return;
      }

      setAdding(true);
      const result = await addProductVariant(productId, colour, sValue, stockNum, sizeSystem);
      setAdding(false);

      if ('error' in result) {
        setError(result.error);
        return;
      }

      setVariants((prev) => [
        ...prev,
        {
          id: result.id,
          colour: colour.trim(),
          size: sValue,
          size_system: sizeSystem,
          size_value: sValue,
          stock: stockNum,
        },
      ]);
      setColour('');
      setSize('');
      setStock('0');
    },
    [colour, size, sizeSystem, stock, productId],
  );

  const handleStockSave = useCallback(
    async (variant: Variant, nextStock: number) => {
      setBusy(variant.id);
      const result = await updateVariantStock(variant.id, nextStock);
      setBusy(null);
      if ('error' in result) {
        setError(result.error);
        return;
      }
      setVariants((prev) => prev.map((v) => (v.id === variant.id ? { ...v, stock: nextStock } : v)));
    },
    [],
  );

  const handleDelete = useCallback(async () => {
    if (!targetDelete) return;
    setDeleting(true);
    const result = await removeProductVariant(targetDelete.id);
    setDeleting(false);
    if ('error' in result) {
      setError(result.error);
      return;
    }
    setVariants((prev) => prev.filter((v) => v.id !== targetDelete.id));
    setTargetDelete(null);
  }, [targetDelete]);

  const inputClass =
    'w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20';

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
      <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
        Variants (colour &amp; size)
      </h3>

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-4 py-2.5 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      {variants.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
          No variants yet. Add colour, size and stock combinations below.
        </p>
      ) : (
        <div className="mb-5 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <th className="px-3 py-2.5">Colour</th>
                <th className="px-3 py-2.5">Size / Option</th>
                <th className="px-3 py-2.5">Stock</th>
                <th className="px-3 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {variants.map((variant) => (
                <VariantRow
                  key={variant.id}
                  variant={variant}
                  busy={busy === variant.id}
                  onStockSave={handleStockSave}
                  onDelete={() => setTargetDelete(variant)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_100px_140px_90px_auto]">
          <input
            value={colour}
            onChange={(e) => setColour(e.target.value)}
            placeholder="Colour (e.g. Black)"
            className={inputClass}
          />
          <select
            value={sizeSystem}
            onChange={(e) => setSizeSystem(e.target.value)}
            className={inputClass}
            aria-label="Size system"
          >
            <option value="EU">EU</option>
            <option value="UK">UK</option>
            <option value="US">US</option>
            <option value="Custom">Custom</option>
          </select>
          <input
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="Size (e.g. 42, 8, Size 5, One Size)"
            className={inputClass}
          />
          <input
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="Stock"
            className={inputClass}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-amber-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-white dark:text-zinc-950 transition-colors hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-zinc-950 disabled:opacity-50"
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={!!targetDelete}
        title="Delete variant"
        message="Are you sure you want to delete this colour/size variant? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setTargetDelete(null)}
      />
    </div>
  );
}

function VariantRow({
  variant,
  busy,
  onStockSave,
  onDelete,
}: {
  variant: Variant;
  busy: boolean;
  onStockSave: (variant: Variant, nextStock: number) => void;
  onDelete: () => void;
}) {
  const [stock, setStock] = useState(String(variant.stock));

  const displaySize = variant.size_system
    ? variant.size_system === 'Custom'
      ? (variant.size_value || String(variant.size))
      : `${variant.size_system} ${variant.size_value || variant.size}`
    : `EU ${variant.size_value || variant.size}`;

  return (
    <tr>
      <td className="px-3 py-2.5 font-bold text-zinc-900 dark:text-white">{variant.colour}</td>
      <td className="px-3 py-2.5 text-zinc-600 dark:text-zinc-300">{displaySize}</td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-20 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-2 py-1 text-sm outline-none focus:border-amber-500"
          />
          <button
            type="button"
            onClick={() => onStockSave(variant, Number(stock))}
            disabled={busy || Number(stock) === variant.stock}
            className="rounded-lg p-1.5 text-zinc-400 dark:text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white disabled:opacity-40"
            title="Save stock"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
          </button>
        </div>
      </td>
      <td className="px-3 py-2.5 text-right">
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg p-1.5 text-zinc-400 dark:text-zinc-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400"
          title="Delete variant"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}