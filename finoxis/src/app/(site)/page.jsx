import Home from '@/views/Home';
import JsonLd from '@/components/JsonLd';
import { getHomeData } from '@/server/pageData';
import { organizationJsonLd, websiteJsonLd } from '@/lib/site';

// Always fresh, exactly like the client-side fetch it replaces.
export const dynamic = 'force-dynamic';

export const metadata = { alternates: { canonical: '/' } };

export default async function Page() {
  // Categories, products and suppliers are in the first HTML, so crawlers see every card and link.
  const { categories, products, sellers } = await getHomeData();
  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      <Home initialCategories={categories} initialProducts={products} initialSellers={sellers} />
    </>
  );
}
