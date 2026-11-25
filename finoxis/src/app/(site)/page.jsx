import Home from '@/views/Home';
import JsonLd from '@/components/JsonLd';
import { getHomeData } from '@/server/pageData';
import { organizationJsonLd, websiteJsonLd } from '@/lib/site';

// Served ready-made from cache and refreshed in the background at most once a minute,
// so a click on "Home" never waits for the database.
export const revalidate = 60;

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
