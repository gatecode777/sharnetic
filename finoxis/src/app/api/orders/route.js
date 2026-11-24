import { handle } from '@/server/http';
import { userProtect } from '@/server/middleware/userAuth';
import { createOrder } from '@/server/controllers/orderController';

export const dynamic = 'force-dynamic';

// /api/orders
export const POST = handle(userProtect, createOrder);
