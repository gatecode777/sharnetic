import { handle } from '@/server/http';
import { protect } from '@/server/middleware/adminAuth';
import { updateOrderStatus } from '@/server/controllers/adminOrderController';

export const dynamic = 'force-dynamic';

// /api/admin/orders/[id]/status
export const PUT = handle(protect, updateOrderStatus);
