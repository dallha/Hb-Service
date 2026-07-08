import { requireAdmin } from '@/lib/auth-admin';
import { redirect } from 'next/navigation';
import BottomNav from '@/components/bottom-nav';
import { DashboardHeader } from '@/components/dashboard-header';

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

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden pb-16 md:pb-0 md:pr-[280px]">
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <DashboardHeader />
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
