import AdminEnquiries from '@/views/admin/AdminEnquiries';

export const metadata = { title: 'Buyer Enquiries', robots: { index: false, follow: false } };

export default function Page() {
  return <AdminEnquiries />;
}
