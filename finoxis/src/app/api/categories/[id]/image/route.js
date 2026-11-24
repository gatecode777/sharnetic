import { handle } from '@/server/http';
import { protect, authorize } from '@/server/middleware/adminAuth';
import { deleteCategoryImage } from '@/server/controllers/categoryController';

export const dynamic = 'force-dynamic';

// /api/categories/[id]/image
export const DELETE = handle(protect, authorize('admin', 'super_admin'), deleteCategoryImage);
