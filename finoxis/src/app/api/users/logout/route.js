import { handle } from '@/server/http';
import { userProtect } from '@/server/middleware/userAuth';
import { logout } from '@/server/controllers/userController';

export const dynamic = 'force-dynamic';

// /api/users/logout
export const POST = handle(userProtect, logout);
