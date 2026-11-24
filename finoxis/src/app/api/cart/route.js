import { handle } from '@/server/http';
import { userProtect } from '@/server/middleware/userAuth';
import { getCart } from '@/server/controllers/cartController';

export const dynamic = 'force-dynamic';

// /api/cart
export const GET = handle(userProtect, getCart);
