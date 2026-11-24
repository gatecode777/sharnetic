import { handle } from '@/server/http';
import { userProtect } from '@/server/middleware/userAuth';
import { getMyOrders } from '@/server/controllers/orderController';

export const dynamic = 'force-dynamic';

// /api/orders/my-orders
export const GET = handle(userProtect, getMyOrders);
