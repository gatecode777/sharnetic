import { handle } from '@/server/http';
import { protect } from '@/server/middleware/adminAuth';
import { changePassword } from '@/server/controllers/adminAuthController';

export const dynamic = 'force-dynamic';

// /api/admin/change-password
export const PUT = handle(protect, changePassword);
