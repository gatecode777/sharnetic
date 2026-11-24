import { handle } from '@/server/http';
import { protect } from '@/server/middleware/adminAuth';
import { exportProducts } from '@/server/controllers/adminProductController';

export const dynamic = 'force-dynamic';

// /api/admin/products/export
export const GET = handle(protect, exportProducts);
