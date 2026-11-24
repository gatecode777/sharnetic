import { handle } from '@/server/http';
import { userProtect } from '@/server/middleware/userAuth';
import { cancelOrder } from '@/server/controllers/orderController';

export const dynamic = 'force-dynamic';

// /api/orders/[id]/cancel
export const PUT = handle(userProtect, cancelOrder);
