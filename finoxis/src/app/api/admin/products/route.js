import { handle } from '@/server/http';
import { protect } from '@/server/middleware/adminAuth';
import { productUpload } from '@/server/upload';
import { getAllProducts, createProduct } from '@/server/controllers/adminProductController';

export const dynamic = 'force-dynamic';

// /api/admin/products
export const GET = handle(protect, getAllProducts);
export const POST = handle(protect, productUpload.array('images', 4), createProduct);
