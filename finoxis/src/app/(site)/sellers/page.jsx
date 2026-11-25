import { Suspense } from 'react';
import SellersPage from '@/views/Sellers';
import { getSellersPageData, readSellerFilters } from '@/server/pageData';
import { buildQuery } from '@/server/seo';

// Rendered per request (reads ?page= etc.); data comes from the shared data cache in server/pageData.js.

export async function generateMetadata({ searchParams }) {
  const filters = readSellerFilters(await searchParams);
  return {
    title: filters.page > 1 ? `Verified Suppliers - Page ${filters.page}` : 'Verified Suppliers',
    description:
      'Directory of verified Indian manufacturers, wholesalers and exporters on Finoxis — filter by industry category and city.',
    alternates: { canonical: `/sellers${buildQuery(filters)}` },
  };
}

export default async function Page({ searchParams }) {
  // Suppliers for the requested ?page= / filters are rendered on the server.
  const filters = readSellerFilters(await searchParams);
  const data = await getSellersPageData(filters);
  return (
    <Suspense fallback={null}>
      <SellersPage initialFilters={filters} initialData={data.sellers} initialCategories={data.categories} />
    </Suspense>
  );
}
