import { handle } from '@/server/http';
import { getAllProducts } from '@/server/controllers/publicProductController';

export const dynamic = 'force-dynamic';

// /api/products
export const GET = handle(getAllProducts);
