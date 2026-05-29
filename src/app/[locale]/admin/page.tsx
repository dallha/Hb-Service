import AdminDashboardClient from '@/components/admin-dashboard-client';
import { requireAdmin } from '@/lib/auth-admin';

export default async function AdminPage() {
  // Layout already verified this, but double checking or getting the user is fine
  const admin = await requireAdmin();

  return <AdminDashboardClient />;
}
