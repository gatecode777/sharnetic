import { handle } from '@/server/http';
import { protect } from '@/server/middleware/adminAuth';
import { getAllOrders } from '@/server/controllers/adminOrderController';

export const dynamic = 'force-dynamic';

// /api/admin/orders
export const GET = handle(protect, getAllOrders);
