import ProductForm from '@/views/admin/ProductForm';

export const metadata = { title: 'Edit Product', robots: { index: false, follow: false } };

export default function Page() {
  return <ProductForm />;
}
