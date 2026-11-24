import { handle } from '@/server/http';
import { protect } from '@/server/middleware/adminAuth';
import { deleteProductImage } from '@/server/controllers/adminProductController';

export const dynamic = 'force-dynamic';

// /api/admin/products/[id]/images/[filename]
export const DELETE = handle(protect, deleteProductImage);
