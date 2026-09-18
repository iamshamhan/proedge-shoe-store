'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState, useRef } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { addProductImage, removeProductImage } from '@/app/admin/actions';
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
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetDelete, setTargetDelete] = useState<Image | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('Please choose an image file (PNG, JPG, WEBP, etc.).');
        return;
      }

      setUploading(true);
      setError(null);

      try {
        const supabase = getSupabaseBrowser();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
        const path = `${productId}/${Date.now()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(path, file);
        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from('product-images').getPublicUrl(path);

        const sortOrder = Math.max(0, ...images.map((i) => i.sort_order)) + 1;
        const result = await addProductImage(productId, publicUrl, file.name, sortOrder);
        if ('error' in result) throw new Error(result.error);

        setImages((prev) => [
          ...prev,
          { id: result.id, url: publicUrl, alt_text: file.name, sort_order: sortOrder },
        ]);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload image.');
      } finally {
        setUploading(false);
      }
    },
    [productId, images, router],
  );

  const handleDelete = useCallback(async () => {
    if (!targetDelete) return;
    setDeleting(true);
    const result = await removeProductImage(targetDelete.id, targetDelete.url);
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
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
          Images
        </h3>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-amber-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-white dark:text-zinc-950 transition-colors hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-zinc-950 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {uploading ? 'Uploading…' : 'Add Image'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
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
          No images yet. Add images so shoppers can see this product.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt_text ?? ''} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setTargetDelete(img)}
                aria-label="Delete image"
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!targetDelete}
        title="Delete image"
        message="Are you sure you want to remove this image from the product? This also deletes the file from storage."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setTargetDelete(null)}
      />
    </div>
  );
}