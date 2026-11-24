import { handle } from '@/server/http';
import { userProtect } from '@/server/middleware/userAuth';
import { removeItem } from '@/server/controllers/cartController';

export const dynamic = 'force-dynamic';

// /api/cart/remove/[productId]
export const DELETE = handle(userProtect, removeItem);
