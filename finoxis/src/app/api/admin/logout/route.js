import { handle } from '@/server/http';
import { protect } from '@/server/middleware/adminAuth';
import { logout } from '@/server/controllers/adminAuthController';

export const dynamic = 'force-dynamic';

// /api/admin/logout
export const POST = handle(protect, logout);
