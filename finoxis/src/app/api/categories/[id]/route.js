import { handle } from '@/server/http';
import { protect, authorize } from '@/server/middleware/adminAuth';
import { categoryUpload } from '@/server/upload';
import { getCategory, updateCategory, deleteCategory } from '@/server/controllers/categoryController';

export const dynamic = 'force-dynamic';

// /api/categories/[id]
export const GET = handle(getCategory);
export const PUT = handle(protect, authorize('admin', 'super_admin'), categoryUpload.single('image'), updateCategory);
export const DELETE = handle(protect, authorize('admin', 'super_admin'), deleteCategory);
