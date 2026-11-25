// One place that builds every public URL, so links, canonicals, breadcrumbs and the sitemap agree.
//
//   /shop                              all products
//   /shop/<category-slug>              one category
//   /shop/<category-slug>/<product>    one product
//   /sellers/<supplier-slug>           one supplier
//
// Old URLs (/shop?category=<id>, /product/<slug>, /seller/<id>, /products) permanently redirect here.

export const categoryPath = (category) => {
  if (category?.slug) return `/shop/${category.slug}`;
  // Category not populated with a slug: the old URL still works (it redirects).
  const id = category?._id || (typeof category === 'string' ? category : '');
  return id ? `/shop?category=${id}` : '/shop';
};

export const productPath = (product) => {
  const slug = product?.category?.slug;
  return slug ? `/shop/${slug}/${product.slug}` : `/product/${product?.slug}`;
};

export const sellerPath = (seller) => `/sellers/${seller?.slug || seller?._id}`;
