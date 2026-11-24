import { handle } from '@/server/http';
import { getProductById } from '@/server/controllers/publicProductController';

export const dynamic = 'force-dynamic';

// /api/products/[id]
export const GET = handle(getProductById);
