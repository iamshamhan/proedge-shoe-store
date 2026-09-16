import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getAuthUser } from '@/lib/auth/admin';
import { AdminLoginForm } from '@/components/admin/login-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sign In',
};

export default async function AdminLoginPage() {
  const user = await getAuthUser();

  // Already signed in as an admin? Go straight to the admin area.
  if (user?.isAdmin) redirect('/admin');

  return <AdminLoginForm />;
}