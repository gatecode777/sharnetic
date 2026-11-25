import { Suspense } from 'react';
import Shop from '@/views/Shop';
import { getShopData, readShopFilters } from '@/server/pageData';
import { buildQuery } from '@/server/seo';
import { categoryPath } from '@/lib/routes';

// Shared by /shop and /shop/[category].
// `category` is the resolved category object on /shop/[category], or null on /shop.

const filtersFor = (searchParams, category) => {
  const filters = readShopFilters(searchParams);
  return { ...filters, category: category ? category._id : '' };
};

export async function shopMetadata(searchParams, category = null) {
  const filters = filtersFor(await searchParams, category);
  const base = category ? categoryPath(category) : '/shop';
  const name = category ? `${category.name} - Wholesale Products` : 'Products Directory';
  return {
    title: filters.page > 1 ? `${name} - Page ${filters.page}` : name,
    description: category
      ? `Buy ${category.name} wholesale from verified Indian manufacturers, wholesalers and exporters on Finoxis.`
      : 'Browse wholesale products with direct prices from verified Indian manufacturers, wholesalers and exporters on Finoxis.',
    // Self-referencing canonical: every paginated / filtered page is its own URL.
    alternates: { canonical: `${base}${buildQuery({ seller: filters.seller, search: filters.search, page: filters.page })}` },
  };
}

export async function renderShop(searchParams, category = null) {
  const filters = filtersFor(await searchParams, category);
  const data = await getShopData(filters);
  return (
    <Suspense fallback={null}>
      <Shop
        initialFilters={filters}
        initialData={data.products}
        initialCategories={data.categories}
        initialSellers={data.sellers}
      />
    </Suspense>
  );
}
