import 'server-only';
import { getProductPageData, getSellerPageData } from './pageData';
import { absoluteUrl, breadcrumbJsonLd } from '@/lib/site';
import { categoryPath, productPath, sellerPath as buildSellerPath } from '@/lib/routes';

const truncate = (text = '', max = 160) => {
  const clean = String(text).replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
};

const absoluteImage = (images = []) => {
  const url = images?.[0]?.url;
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return url.startsWith('/') ? absoluteUrl(url) : undefined;
};

/** Build `?a=1&b=2` from an object, skipping empty values and page=1. */
export const buildQuery = (params) => {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (key === 'page' && Number(value) <= 1) continue;
    qs.set(key, String(value));
  }
  const s = qs.toString();
  return s ? `?${s}` : '';
};

/** Metadata for /shop/[category]/[slug]; never throws (falls back to defaults). */
export async function productMetadata(slug) {
  const data = await getProductPageData(slug);
  if (!data?.product) return { title: 'Product not found' };

  const { product } = data;
  const image = absoluteImage(product.images);
  const canonical = productPath(product);
  const description =
    truncate(product.description) || `Buy ${product.name} wholesale from verified suppliers on Finoxis.`;

  return {
    title: product.name,
    description,
    alternates: { canonical },
    openGraph: { title: product.name, description, url: canonical, ...(image ? { images: [image] } : {}) },
  };
}

/** Product + BreadcrumbList JSON-LD for a product page. */
export function productJsonLd(product) {
  const url = absoluteUrl(productPath(product));
  const images = (product.images || []).map((img) => absoluteImage([img])).filter(Boolean);
  const inStock = product.stock?.inStock !== false;

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    url,
    sku: product._id,
    ...(images.length ? { image: images } : {}),
    ...(product.description ? { description: truncate(product.description, 5000) } : {}),
    ...(product.category?.name ? { category: product.category.name } : {}),
    ...(product.seller?.name ? { brand: { '@type': 'Brand', name: product.seller.name } } : {}),
    ...(typeof product.pricing?.price === 'number'
      ? {
          offers: {
            '@type': 'Offer',
            url,
            priceCurrency: 'INR',
            price: product.pricing.price,
            availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
            ...(product.seller?.name ? { seller: { '@type': 'Organization', name: product.seller.name } } : {}),
          },
        }
      : {}),
  };

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/shop' },
  ];
  if (product.category?._id && product.category?.name) {
    crumbs.push({ name: product.category.name, path: categoryPath(product.category) });
  }
  crumbs.push({ name: product.name, path: productPath(product) });

  return [productLd, breadcrumbJsonLd(crumbs)];
}

const sellerPath = (seller, fallbackId) => buildSellerPath({ slug: seller.slug, _id: seller._id || fallbackId });

/** Metadata for /sellers/[id] (id or slug, same lookup as the API). */
export async function sellerMetadata(id) {
  const data = await getSellerPageData(id);
  if (!data?.seller) return { title: 'Supplier not found' };

  const { seller } = data;
  const location = [seller.city, seller.state].filter(Boolean).join(', ');
  const description =
    truncate(seller.description) || `${seller.name}${location ? ` — verified supplier in ${location}` : ''} on Finoxis.`;
  const canonical = sellerPath(seller, id);

  return {
    title: seller.name,
    description,
    alternates: { canonical },
    openGraph: { title: seller.name, description, url: canonical },
  };
}

/** Organization + BreadcrumbList JSON-LD for a supplier page. */
export function sellerJsonLd(seller, id) {
  const path = sellerPath(seller, id);
  const orgLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: seller.name,
    url: absoluteUrl(path),
    ...(seller.description ? { description: truncate(seller.description, 5000) } : {}),
    ...(seller.city || seller.state
      ? {
          address: {
            '@type': 'PostalAddress',
            ...(seller.address ? { streetAddress: seller.address } : {}),
            ...(seller.city ? { addressLocality: seller.city } : {}),
            ...(seller.state ? { addressRegion: seller.state } : {}),
            addressCountry: 'IN',
          },
        }
      : {}),
    ...(seller.yearEstablished ? { foundingDate: String(seller.yearEstablished) } : {}),
  };

  return [
    orgLd,
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Suppliers', path: '/sellers' },
      { name: seller.name, path },
    ]),
  ];
}
