import { handle } from '@/server/http';
import { searchProducts } from '@/server/controllers/publicProductController';

export const dynamic = 'force-dynamic';

// /api/products/search
export const GET = handle(searchProducts);
