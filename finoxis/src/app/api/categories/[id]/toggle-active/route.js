import { handle } from '@/server/http';
import { protect, authorize } from '@/server/middleware/adminAuth';
import { toggleActive } from '@/server/controllers/categoryController';

export const dynamic = 'force-dynamic';

// /api/categories/[id]/toggle-active
export const PUT = handle(protect, authorize('admin', 'super_admin'), toggleActive);
