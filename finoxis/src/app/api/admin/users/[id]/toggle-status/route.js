import { handle } from '@/server/http';
import { protect, authorize } from '@/server/middleware/adminAuth';
import { toggleUserStatus } from '@/server/controllers/adminUserController';

export const dynamic = 'force-dynamic';

// /api/admin/users/[id]/toggle-status
export const PUT = handle(protect, authorize('users.edit'), toggleUserStatus);
