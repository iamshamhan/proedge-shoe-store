'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Save, Trash2, Sparkles } from 'lucide-react';
import {
  addProductVariant,
  addProductVariantsBulk,
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

const SIZE_RUN_PRESETS: { label: string; system: string; sizes: string[] }[] = [
  { label: 'EU 39–45 (Men)', system: 'EU', sizes: ['39', '40', '41', '42', '43', '44', '45'] },
  { label: 'EU 36–41 (Women)', system: 'EU', sizes: ['36', '37', '38', '39', '40', '41'] },
  { label: 'UK 6–11', system: 'UK', sizes: ['6', '7', '8', '9', '10', '11'] },
  { label: 'US 7–12', system: 'US', sizes: ['7', '8', '9', '10', '11', '12'] },
  { label: 'Apparel S–XXL', system: 'Custom', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
  { label: 'Balls (Size 3–5)', system: 'Custom', sizes: ['Size 3', 'Size 4', 'Size 5'] },
];

export function VariantManager({ productId, variants: initialVariants }: VariantManagerProps) {
  const router = useRouter();
  const [variants, setVariants] = useState(initialVariants);
  const [colour, setColour] = useState('');
  const [sizeSystem, setSizeSystem] = useState('EU');
  const [size, setSize] = useState('');
  const [stock, setStock] = useState('5');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [bulkAdding, setBulkAdding] = useState(false);
  const [targetDelete, setTargetDelete] = useState<Variant | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setVariants(initialVariants);
  }, [initialVariants]);

  const handleAdd = useCallback(async () => {
    try {
      setError(null);
      setSuccessMsg(null);

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

      // Support comma-separated sizes in the single size input as well!
      if (sValue.includes(',')) {
        const parsedSizes = sValue
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        setAdding(true);
        const res = await addProductVariantsBulk(
          productId,
          colour.trim(),
          parsedSizes,
          stockNum,
          sizeSystem,
        );
        setAdding(false);
        if ('error' in res) {
          setError(res.error);
          return;
        }
        setVariants((prev) => [...prev, ...res.added]);
        setSize('');
        setSuccessMsg(`Added ${res.added.length} variants for ${colour.trim()}.`);
        router.refresh();
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
      setSize('');
      router.refresh();

    } catch {
      setError('The operation could not be completed. Check your connection and refresh before retrying.');
    } finally {
      setAdding(false);
    }
  }, [colour, size, sizeSystem, stock, productId, router]);

  const handleBulkPreset = useCallback(
    async (preset: { label: string; system: string; sizes: string[] }) => {
      try {
        setError(null);
        setSuccessMsg(null);

        const cleanColour = colour.trim() || 'Standard';
        const stockNum = Number(stock);

        if (!Number.isInteger(stockNum) || stockNum < 0) {
          setError('Enter a valid default stock per size (0 or more) before generating a size run.');
          return;
        }

        setBulkAdding(true);
        const result = await addProductVariantsBulk(
          productId,
          cleanColour,
          preset.sizes,
          stockNum,
          preset.system,
        );
        setBulkAdding(false);

        if ('error' in result) {
          setError(result.error);
          return;
        }

        setVariants((prev) => [...prev, ...result.added]);
        setSuccessMsg(
          `Generated ${result.added.length} variants (${preset.label}) for "${cleanColour}" with ${stockNum} stock each.`,
        );
        router.refresh();

      } catch {
        setError('The operation could not be completed. Check your connection and refresh before retrying.');
      } finally {
        setBulkAdding(false);
      }
  },
    [colour, stock, productId, router],
  );

  const handleStockSave = useCallback(
    async (variant: Variant, nextStock: number) => {
      setError(null);
      setBusy(variant.id);
      try {
        const result = await updateVariantStock(variant.id, nextStock, variant.stock);
        if ('error' in result) {
          setError(result.error);
          router.refresh();
          return;
        }
        setVariants((prev) => prev.map((v) => (v.id === variant.id ? { ...v, stock: nextStock } : v)));
        router.refresh();
      } catch {
        setError('Could not save stock. Refresh the product before retrying.');
      } finally {
        setBusy(null);
      }
    },
    [router],
  );

  const handleDelete = useCallback(async () => {
    try {
      if (!targetDelete) return;
      setDeleting(true);
      const result = await removeProductVariant(targetDelete.id);
      setDeleting(false);
      if ('error' in result) {
        setError(result.error);
        setTargetDelete(null);
        return;
      }
      setVariants((prev) => prev.filter((v) => v.id !== targetDelete.id));
      setTargetDelete(null);
      router.refresh();

    } catch {
      setError('The operation could not be completed. Check your connection and refresh before retrying.');
    } finally {
      setDeleting(false);
    }
  }, [targetDelete, router]);

  const totalStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

  const inputClass =
    'w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20';

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
            Variants (Colour, Size &amp; Stock)
          </h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            {variants.length} {variants.length === 1 ? 'variant' : 'variants'} · {totalStock} total units in stock
          </p>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-4 py-2.5 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      {successMsg && (
        <p className="mb-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2.5 text-sm text-emerald-700 dark:text-emerald-300">
          {successMsg}
        </p>
      )}

      {variants.length === 0 ? (
        <p className="mb-5 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
          No variants yet. Add a single size or use the 1-Click Size Run Generator below.
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

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_100px_160px_90px_auto]">
          <input
            value={colour}
            onChange={(e) => setColour(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder="Colour (e.g. Black / Gold)"
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder="Size (e.g. 42 or 40,41,42)"
            className={inputClass}
          />
          <input
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder="Stock"
            className={inputClass}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding || bulkAdding}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-amber-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-white dark:text-zinc-950 transition-colors hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-zinc-950 disabled:opacity-50"
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add
          </button>
        </div>

        {/* 1-Click Size Run Generator */}
        <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/30 p-3.5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>1-Click Bulk Size Run Generator</span>
            </span>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
              Uses Colour ({colour.trim() || 'Standard'}) &amp; Stock ({stock || 0}) above
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SIZE_RUN_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                disabled={bulkAdding || adding}
                onClick={() => handleBulkPreset(preset)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors disabled:opacity-50"
              >
                {bulkAdding ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Plus className="w-3 h-3 text-amber-500" />
                )}
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!targetDelete}
        title="Delete Variant?"
        message="Are you sure you want to delete this size/colour variant? This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Keep Variant"
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

  useEffect(() => {
    setStock(String(variant.stock));
  }, [variant.stock]);

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
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (Number(stock) !== variant.stock) {
                  onStockSave(variant, Number(stock));
                }
              }
            }}
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