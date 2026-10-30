'use client';
import Image from 'next/image';
import { useStoreSettings } from '@/context/settings-context';
export function BrandLogo({ stacked = false, className = '' }: { stacked?: boolean; className?: string }) {
  const settings = useStoreSettings();
  const fallback = stacked ? '/images/branding/logo-stacked.svg' : '/images/branding/logo-horizontal.svg';
  return <Image src={(stacked ? settings.logoStackedUrl : settings.logoHorizontalUrl) || fallback}
    alt={settings.brandName || 'PROEDGE'} width={1280} height={stacked ? 976 : 489}
    className={className || (stacked ? 'h-auto w-48 rounded-xl bg-white object-contain' : 'h-auto w-28 sm:w-36 rounded-md bg-white object-contain')}
    onError={event => { const img = event.currentTarget; img.srcset = ''; img.src = fallback; }} />;
}
