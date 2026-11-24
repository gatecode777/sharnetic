import ProductDetails from '@/views/ProductDetails';
import { productMetadata } from '@/server/seo';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return productMetadata(slug);
}

export default function Page() {
  return <ProductDetails />;
}
