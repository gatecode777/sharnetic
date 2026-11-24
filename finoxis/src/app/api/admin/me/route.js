import { handle } from '@/server/http';
import { protect } from '@/server/middleware/adminAuth';
import { getMe } from '@/server/controllers/adminAuthController';

export const dynamic = 'force-dynamic';

// /api/admin/me
export const GET = handle(protect, getMe);
