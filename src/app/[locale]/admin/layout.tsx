import { requireAdmin } from '@/lib/auth-admin';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const admin = await requireAdmin();

  if (!admin) {
    // If not admin, redirect to login page
    redirect(`/${locale}/login`);
  }

  return <>{children}</>;
}
