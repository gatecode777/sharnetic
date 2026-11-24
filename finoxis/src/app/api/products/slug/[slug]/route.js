import { handle } from '@/server/http';
import { getProductBySlug } from '@/server/controllers/publicProductController';

export const dynamic = 'force-dynamic';

// /api/products/slug/[slug]
export const GET = handle(getProductBySlug);
