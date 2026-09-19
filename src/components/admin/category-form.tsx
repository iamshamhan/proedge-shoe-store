'use client';
import Image from 'next/image';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, AlertCircle, Upload, Loader2 } from 'lucide-react';
import { createCategory, updateCategory } from '@/app/admin/actions';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import Link from 'next/link';

type CategoryFormProps = {
  initialData?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    subtitle?: string;
    tagline?: string;
    parent_id?: string;
  };
  parentCategories?: { id: string; name: string }[];
  defaultParentId?: string;
};

export function CategoryForm({ parentCategories = [], defaultParentId, initialData }: CategoryFormProps) {
  const isEdit = !!initialData;
  const router = useRouter();
  
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [slugTouched, setSlugTouched] = useState(!!initialData);
  const [description, setDescription] = useState(initialData?.description || '');
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '');
  const [tagline, setTagline] = useState(initialData?.tagline || '');
  const [parentId, setParentId] = useState(initialData?.parent_id || defaultParentId || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!slugTouched) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugTouched(true);
    setSlug(
      e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9\-]+/g, '')
        .replace(/(^-|-$)+/g, '')
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }

    setIsUploadingImage(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowser();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const path = `categories/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(path);

      setImageUrl(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setError('Name and slug are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      image_url: imageUrl.trim() || undefined,
      subtitle: subtitle.trim() || undefined,
      tagline: tagline.trim() || undefined,
      parent_id: parentId || undefined,
    };

    try {
      const res = isEdit
        ? await updateCategory(initialData!.id, payload)
        : await createCategory(payload);

      if ('error' in res) {
        setError(res.error);
        setIsSubmitting(false);
        return;
      }

      router.push('/admin/categories');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/categories"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-wider">
              {isEdit ? 'Edit Category' : (parentId ? 'New Subcategory' : 'New Main Category')}
            </h1>
            <p className="text-sm text-zinc-500">
              {isEdit ? `Editing /${slug}` : `Create a new ${parentId ? 'subcategory' : 'main category'}`}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isUploadingImage}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-zinc-950 transition-colors hover:bg-amber-400 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{isSubmitting ? 'Saving...' : (isEdit ? 'Update Category' : 'Create Category')}</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200/50 bg-rose-50/50 p-4 text-sm font-medium text-rose-600 dark:border-rose-900/30 dark:bg-rose-900/10 dark:text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs p-6 space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. Football"
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              URL Slug *
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={handleSlugChange}
              placeholder="football"
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
            />
          </div>
        </div>

        {!parentId && (
          <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/50 space-y-5">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-2">Homepage Display Settings</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Category Image
              </label>
              <div className="flex items-start gap-4">
                {imageUrl && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shrink-0 bg-white">
                    <Image src={imageUrl} alt="Category" fill className="object-cover" unoptimized />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Enter external URL..."
                      className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-zinc-900 dark:bg-amber-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-white dark:text-zinc-950 transition-colors hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-zinc-950 disabled:opacity-50"
                    >
                      {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500">Upload a local image from your computer or paste an external URL. Ideal ratio: 3:4 or 1:1.</p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Matchday Precision & Speed"
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Boots, Turf Shoes, Match Balls & Protection"
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
            placeholder="Brief description of this category..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Parent Category (Optional)
          </label>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
          >
            <option value="">None (Top-Level Category)</option>
            {parentCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-zinc-500 mt-1">
            If left blank, this will be a top-level category displayed on the homepage.
          </p>
        </div>
      </div>
    </form>
  );
}


