import { handle } from '@/server/http';
import { protect } from '@/server/middleware/adminAuth';
import { productUpload } from '@/server/upload';
import { getProductById, updateProduct, deleteProduct } from '@/server/controllers/adminProductController';

export const dynamic = 'force-dynamic';

// /api/admin/products/[id]
export const GET = handle(protect, getProductById);
export const PUT = handle(protect, productUpload.array('images', 4), updateProduct);
export const DELETE = handle(protect, deleteProduct);
