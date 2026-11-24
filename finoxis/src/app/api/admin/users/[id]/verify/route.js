import { handle } from '@/server/http';
import { protect, authorize } from '@/server/middleware/adminAuth';
import { verifyUser } from '@/server/controllers/adminUserController';

export const dynamic = 'force-dynamic';

// /api/admin/users/[id]/verify
export const PUT = handle(protect, authorize('users.edit'), verifyUser);
