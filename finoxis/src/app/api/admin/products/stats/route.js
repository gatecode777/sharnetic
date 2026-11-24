import { handle } from '@/server/http';
import { protect } from '@/server/middleware/adminAuth';
import { getStats } from '@/server/controllers/adminProductController';

export const dynamic = 'force-dynamic';

// /api/admin/products/stats
export const GET = handle(protect, getStats);
