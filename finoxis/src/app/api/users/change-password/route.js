import { handle } from '@/server/http';
import { userProtect } from '@/server/middleware/userAuth';
import { changePassword } from '@/server/controllers/userController';

export const dynamic = 'force-dynamic';

// /api/users/change-password
export const PUT = handle(userProtect, changePassword);
