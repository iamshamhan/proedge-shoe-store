'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, useRef } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Plus, Star, Trash2 } from 'lucide-react';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import {
  addProductImage,
  removeProductImage,
  reorderProductImages,
} from '@/app/admin/actions';
import { ConfirmDialog } from './confirm-dialog';

type Image = {
  id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
};

type ImageManagerProps = {
  productId: string;
  images: Image[];
};

export function ImageManager({ productId, images: initialImages }: ImageManagerProps) {
  const router = useRouter();
  const [images, setImages] = useState(() =>
    [...initialImages].sort((a, b) => a.sort_order - b.sort_order),
  );
  const [uploading, setUploading] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetDelete, setTargetDelete] = useState<Image | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImages([...initialImages].sort((a, b) => a.sort_order - b.sort_order));
  }, [initialImages]);

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;

      const invalid = files.find((f) => !f.type.startsWith('image/'));
      if (invalid) {
        setError('Please choose only image files (PNG, JPG, WEBP, etc.).');
        return;
      }

      setUploading(true);
      setError(null);

      try {
        const supabase = getSupabaseBrowser();
        let nextSortOrder = Math.max(0, ...images.map((i) => i.sort_order)) + 1;
        const newlyAdded: Image[] = [];

        for (const file of files) {
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
          const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${safeName}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(path, file);
          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from('product-images').getPublicUrl(path);

          const result = await addProductImage(productId, publicUrl, file.name, nextSortOrder);
          if ('error' in result) throw new Error(result.error);

          newlyAdded.push({
            id: result.id,
            url: publicUrl,
            alt_text: file.name,
            sort_order: nextSortOrder,
          });
          nextSortOrder += 1;
        }

        setImages((prev) => [...prev, ...newlyAdded]);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload image.');
      } finally {
        setUploading(false);
      }
    },
    [productId, images, router],
  );

  const handleReorder = useCallback(
    async (nextImages: Image[]) => {
      setError(null);
      const updated = nextImages.map((img, idx) => ({ ...img, sort_order: idx + 1 }));
      setImages(updated);
      setReordering(true);
      const res = await reorderProductImages(
        productId,
        updated.map((i) => i.id),
      );
      setReordering(false);
      if ('error' in res) {
        setError(res.error);
        return;
      }
      router.refresh();
    },
    [productId, router],
  );

  const handleSetPrimary = useCallback(
    (index: number) => {
      if (index <= 0 || index >= images.length) return;
      const next = [...images];
      const [chosen] = next.splice(index, 1);
      next.unshift(chosen);
      handleReorder(next);
    },
    [images, handleReorder],
  );

  const handleMove = useCallback(
    (index: number, direction: -1 | 1) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= images.length) return;
      const next = [...images];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      handleReorder(next);
    },
    [images, handleReorder],
  );

  const handleDelete = useCallback(async () => {
    if (!targetDelete) return;
    setDeleting(true);
    const result = await removeProductImage(targetDelete.id);
    setDeleting(false);
    if ('error' in result) {
      setError(result.error);
      return;
    }
    setImages((prev) => prev.filter((img) => img.id !== targetDelete.id));
    setTargetDelete(null);
    router.refresh();
  }, [targetDelete, router]);

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
            Product Gallery ({images.length})
          </h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            First image is the primary cover photo. Second image appears on hover.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || reordering}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-amber-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-white dark:text-zinc-950 transition-colors hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-zinc-950 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {uploading ? 'Uploading…' : 'Upload Images'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files);
            }
            e.target.value = '';
          }}
        />
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-4 py-2.5 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      {images.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
          No images yet. Upload one or more photos so shoppers can see this product.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img, idx) => {
            const isPrimary = idx === 0;
            return (
              <div
                key={img.id}
                className={`group relative aspect-square overflow-hidden rounded-xl border bg-zinc-100 dark:bg-zinc-800/50 ${
                  isPrimary
                    ? 'border-amber-500 ring-2 ring-amber-500/30'
                    : 'border-zinc-200 dark:border-zinc-700'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt_text ?? ''} className="h-full w-full object-cover" />

                {/* Cover Badge */}
                {isPrimary ? (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-zinc-950 shadow-xs">
                    <Star className="h-2.5 w-2.5 fill-zinc-950" />
                    Cover
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={reordering}
                    onClick={() => handleSetPrimary(idx)}
                    title="Set as primary cover photo"
                    className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/65 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white opacity-100 sm:opacity-0 transition-opacity hover:bg-amber-500 hover:text-zinc-950 sm:group-hover:opacity-100"
                  >
                    <Star className="h-3 w-3" />
                    <span>Set Cover</span>
                  </button>
                )}

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => setTargetDelete(img)}
                  aria-label="Delete image"
                  title="Delete image"
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/65 text-white opacity-100 sm:opacity-0 transition-opacity hover:bg-red-600 sm:group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                {/* Reorder Controls */}
                {images.length > 1 && (
                  <div className="absolute inset-x-2 bottom-2 flex items-center justify-between opacity-100 sm:opacity-0 transition-opacity sm:group-hover:opacity-100">
                    <button
                      type="button"
                      disabled={idx === 0 || reordering}
                      onClick={() => handleMove(idx, -1)}
                      aria-label="Move image left"
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/65 text-white hover:bg-zinc-900 disabled:opacity-30"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                    <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      disabled={idx === images.length - 1 || reordering}
                      onClick={() => handleMove(idx, 1)}
                      aria-label="Move image right"
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/65 text-white hover:bg-zinc-900 disabled:opacity-30"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!targetDelete}
        title="Delete Image?"
        message="Remove this image from the product gallery? The file will be deleted from storage."
        confirmLabel="Delete"
        cancelLabel="Keep Image"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setTargetDelete(null)}
      />
    </div>
  );
}