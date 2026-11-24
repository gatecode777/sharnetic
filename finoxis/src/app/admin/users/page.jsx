import AdminUsers from '@/views/admin/AdminUsers';

export const metadata = { title: 'Users', robots: { index: false, follow: false } };

export default function Page() {
  return <AdminUsers />;
}
