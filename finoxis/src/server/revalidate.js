import 'server-only';
import { revalidatePath, revalidateTag } from 'next/cache';

/** Tag carried by every cached catalog query (see server/pageData.js). */
export const CATALOG_TAG = 'catalog';

// API areas whose writes change what public pages show: products (incl. toggles, images and
// bulk import), suppliers, categories, and orders (they change stock).
const CATALOG_WRITE_PATHS = /^\/api\/(admin\/products|sellers|categories|orders)(\/|$)/;

export const isCatalogWrite = (method, path) =>
  !['GET', 'HEAD', 'OPTIONS'].includes(method) && CATALOG_WRITE_PATHS.test(path);

/** Drop cached catalog data and pages so the next visit shows the change immediately. */
export function refreshCatalog() {
  try {
    revalidateTag(CATALOG_TAG, { expire: 0 });
    revalidatePath('/');
    revalidatePath('/about');
    // Dynamic routes are matched by file path, so the (site) route group is part of the pattern.
    revalidatePath('/(site)/shop/[category]/[slug]', 'page');
    revalidatePath('/(site)/sellers/[id]', 'page');
  } catch (err) {
    // Never fail the admin's save because of the cache; the timed refresh still applies.
    console.error('refreshCatalog error:', err.message);
  }
}
