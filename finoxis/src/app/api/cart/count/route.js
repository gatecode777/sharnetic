import { handle } from '@/server/http';
import { userProtect } from '@/server/middleware/userAuth';
import { getCartCount } from '@/server/controllers/cartController';

export const dynamic = 'force-dynamic';

// /api/cart/count
export const GET = handle(userProtect, getCartCount);
