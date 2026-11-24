import { handle } from '@/server/http';
import { protect, authorize } from '@/server/middleware/adminAuth';
import { categoryUpload } from '@/server/upload';
import { getAllCategories, createCategory } from '@/server/controllers/categoryController';

export const dynamic = 'force-dynamic';

// /api/categories
export const GET = handle(getAllCategories);
export const POST = handle(protect, authorize('admin', 'super_admin'), categoryUpload.single('image'), createCategory);
