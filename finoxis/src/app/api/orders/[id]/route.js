import { handle } from '@/server/http';
import { userProtect } from '@/server/middleware/userAuth';
import { getOrderById } from '@/server/controllers/orderController';

export const dynamic = 'force-dynamic';

// /api/orders/[id]
export const GET = handle(userProtect, getOrderById);
