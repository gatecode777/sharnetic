import connectDB from '@/server/db';
import Product from '@/server/models/Product';
import Seller from '@/server/models/Seller';
import Category from '@/server/models/Category';
import { absoluteUrl } from '@/lib/site';
import { categoryPath, productPath, sellerPath } from '@/lib/routes';

// Served at /sitemap.xml and rebuilt from the database at most once an hour,
// so new products, suppliers and categories appear automatically.
export const revalidate = 3600;

const STATIC_PAGES = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/shop', changeFrequency: 'daily', priority: 0.9 },
  { path: '/sellers', changeFrequency: 'daily', priority: 0.9 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/terms-and-condition', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/refund-policy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/cancellation-policy', changeFrequency: 'yearly', priority: 0.3 },
];

// One sitemap file may hold at most 50,000 URLs.
const MAX_URLS = 50000;

export default async function sitemap() {
  const entries = STATIC_PAGES.map(({ path, ...rest }) => ({ url: absoluteUrl(path), ...rest }));

  try {
    await connectDB();
    const [categories, sellers, products] = await Promise.all([
      Category.find({}).select('_id slug isActive updatedAt').lean(),
      Seller.find({ isActive: true }).select('_id slug updatedAt').lean(),
      Product.find({ isActive: true }).select('slug category updatedAt').sort({ updatedAt: -1 }).lean(),
    ]);

    // Category listings: /shop/<category-slug>
    const categorySlug = new Map(categories.map((c) => [String(c._id), c.slug]));
    for (const c of categories) {
      if (!c.isActive || !c.slug) continue;
      entries.push({
        url: absoluteUrl(categoryPath(c)),
        lastModified: c.updatedAt,
        changeFrequency: 'daily',
        priority: 0.8,
      });
    }

    for (const s of sellers) {
      entries.push({
        url: absoluteUrl(sellerPath(s)),
        lastModified: s.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }

    for (const p of products) {
      if (!p.slug) continue;
      entries.push({
        url: absoluteUrl(productPath({ slug: encodeURIComponent(p.slug), category: { slug: categorySlug.get(String(p.category)) } })),
        lastModified: p.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  } catch (err) {
    // Database unreachable: still serve a valid sitemap with the main pages.
    console.error('sitemap error:', err.message);
  }

  return entries.slice(0, MAX_URLS);
}
