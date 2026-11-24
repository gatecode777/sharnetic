import { handle } from '@/server/http';
import { userProtect } from '@/server/middleware/userAuth';
import { clearCart } from '@/server/controllers/cartController';

export const dynamic = 'force-dynamic';

// /api/cart/clear
export const DELETE = handle(userProtect, clearCart);
