import { handle } from '@/server/http';
import { protect, authorize } from '@/server/middleware/adminAuth';
import { getUserById, updateUser, deleteUser } from '@/server/controllers/adminUserController';

export const dynamic = 'force-dynamic';

// /api/admin/users/[id]
export const GET = handle(protect, authorize('users.view'), getUserById);
export const PUT = handle(protect, authorize('users.edit'), updateUser);
export const DELETE = handle(protect, authorize('users.delete'), deleteUser);
