'use client';
import Image from 'next/image';
import { useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/client';

export function LogoPicker({ label, value, fallback, disabled, onChange, onUploading }: {
  label: string; value: string; fallback: string; disabled: boolean;
  onChange: (url: string) => void; onUploading: (busy: boolean) => void;
}) {
  const [error, setError] = useState('');
  return <div className="space-y-3 rounded-2xl border border-black/10 dark:border-white/10 p-4">
    <p className="text-sm font-semibold">{label}</p>
    <div className="flex h-32 items-center justify-center rounded-xl bg-white p-3">
      <Image src={value || fallback} alt={label + ' preview'} width={240} height={110} className="h-full w-auto max-w-full object-contain" />
    </div>
    <label className="block text-sm">
      <span className="mb-2 block">Upload PNG, JPEG or WebP (up to 2 MB)</span>
      <input type="file" accept="image/png,image/jpeg,image/webp" disabled={disabled}
        className="block w-full text-xs disabled:opacity-50"
        onChange={async event => {
          const file = event.target.files?.[0]; event.target.value = '';
          if (!file) return;
          setError('');
          const extensions: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };
          if (!extensions[file.type] || file.size > 2 * 1024 * 1024) {
            setError('Choose a PNG, JPEG or WebP image smaller than 2 MB.'); return;
          }
          onUploading(true);
          try {
            const db = getSupabaseBrowser();
            const path = 'branding/' + crypto.randomUUID() + '.' + extensions[file.type];
            const { error: uploadError } = await db.storage.from('product-images').upload(path, file, { contentType: file.type, upsert: false });
            if (uploadError) throw uploadError;
            const { data } = db.storage.from('product-images').getPublicUrl(path);
            onChange(data.publicUrl);
          } catch { setError('Logo upload failed. Please try again.'); }
          finally { onUploading(false); }
        }} />
    </label>
    <button type="button" disabled={disabled} onClick={() => { onChange(fallback); setError(''); }} className="text-xs underline disabled:opacity-50">Use original logo</button>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
  </div>;
}
