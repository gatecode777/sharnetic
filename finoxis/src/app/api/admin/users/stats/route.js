import { handle } from '@/server/http';
import { protect } from '@/server/middleware/adminAuth';
import { getUserStats } from '@/server/controllers/adminUserController';

export const dynamic = 'force-dynamic';

// /api/admin/users/stats
export const GET = handle(protect, getUserStats);
