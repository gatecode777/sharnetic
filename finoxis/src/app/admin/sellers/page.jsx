import AdminSellers from '@/views/admin/AdminSellers';

export const metadata = { title: 'Suppliers', robots: { index: false, follow: false } };

export default function Page() {
  return <AdminSellers />;
}
