import { handle } from '@/server/http';
import { protect } from '@/server/middleware/adminAuth';
import { updateProfile } from '@/server/controllers/adminAuthController';

export const dynamic = 'force-dynamic';

// /api/admin/profile
export const PUT = handle(protect, updateProfile);
