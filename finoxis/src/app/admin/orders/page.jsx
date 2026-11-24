import AdminOrders from '@/views/admin/AdminOrders';

export const metadata = { title: 'Orders', robots: { index: false, follow: false } };

export default function Page() {
  return <AdminOrders />;
}
