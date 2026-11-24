import { handle } from '@/server/http';
import { userProtect } from '@/server/middleware/userAuth';
import { addToCart } from '@/server/controllers/cartController';

export const dynamic = 'force-dynamic';

// /api/cart/add
export const POST = handle(userProtect, addToCart);
