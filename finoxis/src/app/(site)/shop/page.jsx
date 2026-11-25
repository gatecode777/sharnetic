import { permanentRedirect } from 'next/navigation';
import { renderShop, shopMetadata } from './renderShop';
import { getCategoryBySlugOrId } from '@/server/pageData';
import { buildQuery } from '@/server/seo';
import { categoryPath } from '@/lib/routes';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }) {
  return shopMetadata(searchParams);
}

export default async function Page({ searchParams }) {
  const params = await searchParams;

  // Old category links (/shop?category=<id>) now live at /shop/<category-slug>.
  const oldCategory = Array.isArray(params.category) ? params.category[0] : params.category;
  if (oldCategory) {
    const category = await getCategoryBySlugOrId(oldCategory);
    if (category) {
      const rest = buildQuery({ seller: params.seller, search: params.search, page: params.page });
      permanentRedirect(`${categoryPath(category)}${rest}`);
    }
    // Unknown category id: show all products, exactly as the old URL did.
  }

  // Products for the requested ?page= / filters are rendered on the server,
  // so /shop?page=3 is a real, crawlable page.
  return renderShop(params);
}
