import SellerDetailPage from '@/views/SellerDetail';
import { sellerMetadata } from '@/server/seo';

export async function generateMetadata({ params }) {
  const { id } = await params;
  return sellerMetadata(id);
}

export default function Page() {
  return <SellerDetailPage />;
}
