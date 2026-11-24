import 'server-only';
import connectDB from './db';
import Product from './models/Product';
import Seller from './models/Seller';

const truncate = (text = '', max = 160) => {
  const clean = String(text).replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
};

const absoluteImage = (images = []) => {
  const url = images?.[0]?.url;
  return url && /^https?:\/\//i.test(url) ? url : undefined;
};

/** Metadata for /product/[slug]; never throws (falls back to defaults). */
export async function productMetadata(slug) {
  try {
    await connectDB();
    const product = await Product.findOne({ slug, isActive: true })
      .select('name description images')
      .lean();
    if (!product) return { title: 'Product not found' };
    const image = absoluteImage(product.images);
    return {
      title: product.name,
      description: truncate(product.description) || `Buy ${product.name} wholesale from verified suppliers on Finoxis.`,
      openGraph: { title: product.name, ...(image ? { images: [image] } : {}) },
    };
  } catch (err) {
    console.error('productMetadata error:', err.message);
    return {};
  }
}

/** Metadata for /seller/[id] (id or slug, same lookup as the API). */
export async function sellerMetadata(id) {
  try {
    await connectDB();
    const query = /^[0-9a-fA-F]{24}$/.test(id) ? { _id: id } : { slug: id };
    const seller = await Seller.findOne(query).select('name description city state').lean();
    if (!seller) return { title: 'Supplier not found' };
    const location = [seller.city, seller.state].filter(Boolean).join(', ');
    return {
      title: seller.name,
      description:
        truncate(seller.description) ||
        `${seller.name}${location ? ` — verified supplier in ${location}` : ''} on Finoxis.`,
    };
  } catch (err) {
    console.error('sellerMetadata error:', err.message);
    return {};
  }
}
