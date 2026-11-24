import { handle } from '@/server/http';
import { userProtect } from '@/server/middleware/userAuth';
import { updateQuantity } from '@/server/controllers/cartController';

export const dynamic = 'force-dynamic';

// /api/cart/update
export const PUT = handle(userProtect, updateQuantity);
