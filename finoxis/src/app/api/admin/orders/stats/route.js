import { handle } from '@/server/http';
import { protect } from '@/server/middleware/adminAuth';
import { getOrderStats } from '@/server/controllers/adminOrderController';

export const dynamic = 'force-dynamic';

// /api/admin/orders/stats
export const GET = handle(protect, getOrderStats);
