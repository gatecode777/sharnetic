import { handle } from '@/server/http';
import { protect, authorize } from '@/server/middleware/adminAuth';
import { getAllUsers } from '@/server/controllers/adminUserController';

export const dynamic = 'force-dynamic';

// /api/admin/users
export const GET = handle(protect, authorize('users.view'), getAllUsers);
