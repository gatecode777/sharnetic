import { notFound, permanentRedirect } from 'next/navigation';
import { renderShop, shopMetadata } from '../renderShop';
import { getCategoryBySlugOrId } from '@/server/pageData';
import { buildQuery } from '@/server/seo';
import { categoryPath } from '@/lib/routes';

export const dynamic = 'force-dynamic';

// /shop/<category-slug>  — the same Products Directory page, filtered to one category.

export async function generateMetadata({ params, searchParams }) {
  const { category: slug } = await params;
  const category = await getCategoryBySlugOrId(slug);
  if (!category) return { title: 'Category not found' };
  return shopMetadata(searchParams, category);
}

export default async function Page({ params, searchParams }) {
  const { category: slug } = await params;
  const category = await getCategoryBySlugOrId(slug);

  if (!category) notFound();

  // Reached by id instead of slug: send to the one correct URL.
  if (category.slug !== slug) {
    const sp = await searchParams;
    permanentRedirect(`${categoryPath(category)}${buildQuery({ seller: sp.seller, search: sp.search, page: sp.page })}`);
  }

  return renderShop(searchParams, category);
}
