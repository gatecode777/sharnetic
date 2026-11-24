import { handle } from '@/server/http';
import { getByCategory } from '@/server/controllers/publicProductController';

export const dynamic = 'force-dynamic';

// /api/products/category/[category]
export const GET = handle(getByCategory);
