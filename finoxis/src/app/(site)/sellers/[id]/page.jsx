import { notFound } from 'next/navigation';
import SellerDetailPage from '@/views/SellerDetail';
import JsonLd from '@/components/JsonLd';
import { getSellerPageData } from '@/server/pageData';
import { sellerJsonLd, sellerMetadata } from '@/server/seo';

// Each supplier page is built on its first visit, then served from cache and refreshed
// in the background at most every 5 minutes.
export const revalidate = 300;
export async function generateStaticParams() {
  return []; // build nothing up front; cache each page on first request
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  return sellerMetadata(id);
}

export default async function Page({ params }) {
  const { id } = await params;
  const data = await getSellerPageData(id);

  // Unknown supplier: a real 404 status instead of a "not found" message on a 200 page.
  if (data?.notFound) notFound();

  return (
    <>
      {data?.seller && <JsonLd data={sellerJsonLd(data.seller, id)} />}
      {/* data is null only if the database was unreachable; the view then loads in the browser as before. */}
      <SellerDetailPage key={id} initialSeller={data?.seller} initialProducts={data?.products} />
    </>
  );
}
