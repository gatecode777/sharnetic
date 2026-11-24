import AdminProducts from '@/views/admin/AdminProducts';

export const metadata = { title: 'Products', robots: { index: false, follow: false } };

export default function Page() {
  return <AdminProducts />;
}
