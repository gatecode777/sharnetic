import AdminProfile from '@/views/admin/AdminProfile';

export const metadata = { title: 'Admin Profile', robots: { index: false, follow: false } };

export default function Page() {
  return <AdminProfile />;
}
