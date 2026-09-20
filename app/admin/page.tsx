import { isAdmin } from '@/lib/admin-auth';
import { AdminDashboard, AdminLogin } from '@/components/admin-analytics';
export const metadata = { title: 'Analytics Admin', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
export default async function AdminPage() {
  return await isAdmin() ? <AdminDashboard /> : <AdminLogin />;
}
