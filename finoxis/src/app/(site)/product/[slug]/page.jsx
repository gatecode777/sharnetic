import { permanentRedirect } from 'next/navigation';
import ProductDetails from '@/views/ProductDetails';
import { getProductPageData } from '@/server/pageData';
import { productPath } from '@/lib/routes';

export const dynamic = 'force-dynamic';

// Old product URL. Products now live at /shop/<category-slug>/<product-slug>;
// this permanently redirects every old /product/<slug> link there.
export default async function Page({ params }) {
  const { slug } = await params;
  const data = await getProductPageData(slug);

  if (data?.redirectTo) permanentRedirect(data.redirectTo);
  if (data?.product) permanentRedirect(productPath(data.product));

  // Database unreachable: keep the page working (it loads in the browser) instead of failing.
  return <ProductDetails key={slug} />;
}
