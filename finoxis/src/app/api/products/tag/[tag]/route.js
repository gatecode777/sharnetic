import { handle } from '@/server/http';
import { getProductsByTag } from '@/server/controllers/publicProductController';

export const dynamic = 'force-dynamic';

// /api/products/tag/[tag]
export const GET = handle(getProductsByTag);
