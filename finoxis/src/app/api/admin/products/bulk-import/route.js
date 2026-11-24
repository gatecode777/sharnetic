import { handle } from '@/server/http';
import { protect } from '@/server/middleware/adminAuth';
import { bulkImportProducts } from '@/server/controllers/adminProductController';

export const dynamic = 'force-dynamic';

// /api/admin/products/bulk-import
export const POST = handle(protect, bulkImportProducts);
