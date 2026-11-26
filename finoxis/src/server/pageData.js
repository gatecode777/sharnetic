import 'server-only';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import connectDB from './db';
import Product from './models/Product';
import { getAllProducts, getProductBySlug } from './controllers/publicProductController';
import { getAllSellers, getSellerById } from './controllers/sellerController';
import { getAllCategories } from './controllers/categoryController';
import { categoryPath } from '@/lib/routes';
import { CATALOG_TAG } from './revalidate';

/**
 * Server-side data for public pages.
 *
 * Each loader runs the SAME controller the /api route uses and returns the SAME
 * JSON the browser would get from axios, so a server-rendered page shows exactly
 * what the client-rendered page showed before. Loaders never throw: on any
 * failure they return null and the view falls back to fetching in the browser.
 */
async function runController(controller, { query = {}, params = {} } = {}) {
  try {
    await connectDB();

    // Express query values are always strings.
    const stringQuery = {};
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') stringQuery[key] = String(value);
    }

    const res = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        // Round-trip through JSON: identical shape to the API response, and plain props for React.
        this.body = JSON.parse(JSON.stringify(data));
        return this;
      },
      send(data) {
        return this.json(data);
      },
      set() {
        return this;
      },
      setHeader() {
        return this;
      },
    };

    await controller({ query: stringQuery, params, headers: {}, body: {} }, res, () => {});
    return { status: res.statusCode, data: res.body };
  } catch (err) {
    console.error('pageData error:', err.message);
    return { status: 500, data: null };
  }
}

const okData = (result) => (result.status === 200 && result.data?.success ? result.data : null);

const toPage = (value) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
};

const first = (value) => (Array.isArray(value) ? value[0] : value) || '';

/*
 * Shared data cache (Next.js Data Cache). On Vercel it is shared by every server instance and
 * survives cold starts, so a category click usually needs no database round-trip at all.
 * Failures throw inside the cached function, so a failed lookup is never cached.
 */
async function runOrThrow(controller, query) {
  const data = okData(await runController(controller, { query }));
  if (!data) throw new Error('pageData: database request failed');
  return data;
}

// Same query in any key order / value type -> same cache entry.
const cacheKey = (query = {}) =>
  Object.keys(query)
    .filter((k) => query[k] !== undefined && query[k] !== null && query[k] !== '')
    .sort()
    .reduce((acc, k) => ({ ...acc, [k]: String(query[k]) }), {});

// Admin edits clear these immediately (server/revalidate.js); the 1 hour limit covers changes made
// outside the website, such as scripts or direct database edits.
const CACHE_OPTIONS = { revalidate: 3600, tags: [CATALOG_TAG] };

const cachedCategories = unstable_cache(
  async () => (await runOrThrow(getAllCategories, { isActive: 'true' })).categories || [],
  ['finoxis-active-categories'],
  CACHE_OPTIONS
);
const cachedProducts = unstable_cache((query) => runOrThrow(getAllProducts, query), ['finoxis-products'], CACHE_OPTIONS);
const cachedSellers = unstable_cache((query) => runOrThrow(getAllSellers, query), ['finoxis-sellers'], CACHE_OPTIONS);

/** Active categories (same call the Home/Shop/Sellers pages make). */
export const getActiveCategories = cache(async () => {
  try {
    return await cachedCategories();
  } catch (err) {
    console.error('getActiveCategories error:', err.message);
    return null;
  }
});

/** Active category by its URL slug (or, for old links, by its id). */
export const getCategoryBySlugOrId = cache(async (value) => {
  const categories = await getActiveCategories();
  if (!categories || !value) return null;
  return categories.find((c) => c.slug === value) || categories.find((c) => c._id === value) || null;
});

/** Product list (cached 60s per filter/page combination). */
export async function getProducts(query) {
  try {
    return await cachedProducts(cacheKey(query));
  } catch (err) {
    console.error('getProducts error:', err.message);
    return null;
  }
}

/** Supplier list (cached 60s per filter/page combination). */
export async function getSellers(query) {
  try {
    return await cachedSellers(cacheKey(query));
  } catch (err) {
    console.error('getSellers error:', err.message);
    return null;
  }
}

/** Homepage: same three requests Home.jsx makes. */
export async function getHomeData() {
  const [categories, products, sellers] = await Promise.all([
    getActiveCategories(),
    getProducts({ limit: 8, sort: '-createdAt', isActive: 'true' }),
    getSellers({ limit: 6 }),
  ]);
  return {
    categories,
    products: products ? products.products || [] : null,
    sellers: sellers ? sellers.sellers || [] : null,
  };
}

/** /shop filters read from the URL, normalised the way Shop.jsx reads them. */
export function readShopFilters(searchParams = {}) {
  return {
    category: first(searchParams.category),
    seller: first(searchParams.seller),
    search: first(searchParams.search),
    page: toPage(first(searchParams.page)),
  };
}

/** /shop: product list + sidebar category list, same requests Shop.jsx makes. */
export async function getShopData(filters) {
  const [products, categories] = await Promise.all([
    getProducts({
      page: filters.page,
      limit: 10, // products per page (must match itemsPerPage in views/Shop.jsx)
      sort: 'createdAt',
      order: 'desc',
      category: filters.category,
      seller: filters.seller,
      search: filters.search.trim(),
    }),
    getActiveCategories(),
  ]);
  return {
    products: products
      ? {
          products: products.products || [],
          totalProducts: products.totalProducts || 0,
          totalPages: products.totalPages || 1,
        }
      : null,
    categories,
  };
}

export function readSellerFilters(searchParams = {}) {
  return {
    category: first(searchParams.category),
    city: first(searchParams.city),
    search: first(searchParams.search),
    page: toPage(first(searchParams.page)),
  };
}

/** /sellers: supplier list + category dropdown, same requests Sellers.jsx makes. */
export async function getSellersPageData(filters) {
  const [sellers, categories] = await Promise.all([
    getSellers({
      page: filters.page,
      limit: 30,
      category: filters.category,
      city: filters.city,
      search: filters.search.trim(),
    }),
    getActiveCategories(),
  ]);
  return {
    sellers: sellers
      ? {
          sellers: sellers.sellers || [],
          totalSellers: sellers.totalSellers || 0,
          totalPages: sellers.totalPages || 1,
        }
      : null,
    categories,
  };
}

/**
 * /shop/[category]/[slug]
 *   { product, related }   product is live (in stock or not)
 *   { redirectTo }         product was deactivated or deleted
 *   null                   database problem: let the browser try as before
 */
export const getProductPageData = cache(async (slug) => {
  const result = await runController(getProductBySlug, { params: { slug } });
  const data = okData(result);

  if (data) {
    const product = data.product;
    const categoryId = product.category?._id || product.category;
    let related = [];
    if (categoryId) {
      const rel = await getProducts({ category: categoryId, limit: 5 });
      related = (rel?.products || []).filter((p) => p._id !== product._id).slice(0, 4);
    }
    return { product, related };
  }

  if (result.status === 404) {
    try {
      const hidden = await Product.findOne({ slug }).select('category').lean();
      const category = hidden?.category ? await getCategoryBySlugOrId(String(hidden.category)) : null;
      return { redirectTo: category ? categoryPath(category) : '/shop' };
    } catch (err) {
      console.error('getProductPageData lookup error:', err.message);
      return null;
    }
  }

  return null;
});

/**
 * /sellers/[id]
 *   { seller, products } | { notFound: true } | null (database problem)
 */
export const getSellerPageData = cache(async (id) => {
  const result = await runController(getSellerById, { params: { id } });
  const data = okData(result);
  if (data) return { seller: data.seller, products: data.products || [] };
  if (result.status === 404) return { notFound: true };
  return null;
});

/** Total active products (the number the About page shows). */
export async function getActiveProductCount() {
  const data = await getProducts({ limit: 1 });
  return data ? data.totalProducts || 0 : null;
}
