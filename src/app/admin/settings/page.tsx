import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Sliders } from 'lucide-react';
import { getAuthUser } from '@/lib/auth/admin';
import { getStoreSettings } from '@/lib/settings';
import { SettingsForm } from './settings-form';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Store Settings | Admin',
};

export default async function AdminSettingsPage() {
  const user = await getAuthUser();
  if (!user?.isAdmin) redirect('/admin/login');

  const settings = await getStoreSettings();

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-800 text-amber-500">
          <Sliders className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-black text-zinc-900 dark:text-white">Store Settings</h1>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Configure free delivery threshold, islandwide shipping fee, and announcements
          </p>
        </div>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
