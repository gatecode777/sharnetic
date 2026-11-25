import { permanentRedirect } from 'next/navigation';
import ProductDetails from '@/views/ProductDetails';
import JsonLd from '@/components/JsonLd';
import { getProductPageData } from '@/server/pageData';
import { productJsonLd, productMetadata } from '@/server/seo';
import { productPath } from '@/lib/routes';

// Each product page is built on its first visit, then served from cache and refreshed
// in the background at most every 5 minutes (admin edits show up within 5 minutes).
export const revalidate = 300;
export async function generateStaticParams() {
  return []; // build nothing up front; cache each page on first request
}

// /shop/<category-slug>/<product-slug>

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return productMetadata(slug);
}

export default async function Page({ params }) {
  const { category, slug } = await params;
  const data = await getProductPageData(slug);

  // Deactivated product -> its category listing; deleted product -> the catalog. Permanent (308) redirect.
  // Out-of-stock products are NOT redirected: they stay live with an "Out of Stock" label.
  if (data?.redirectTo) permanentRedirect(data.redirectTo);

  // Wrong or outdated category in the URL (e.g. product moved category) -> the one correct URL.
  if (data?.product?.category?.slug && data.product.category.slug !== category) {
    permanentRedirect(productPath(data.product));
  }

  return (
    <>
      {data?.product && <JsonLd data={productJsonLd(data.product)} />}
      {/* data is null only if the database was unreachable; the view then loads in the browser as before. */}
      <ProductDetails key={slug} initialProduct={data?.product} initialRelated={data?.related} />
    </>
  );
}
