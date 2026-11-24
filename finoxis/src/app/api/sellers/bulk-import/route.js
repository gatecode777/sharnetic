import { handle } from '@/server/http';
import { protect } from '@/server/middleware/adminAuth';
import { bulkImportSellers } from '@/server/controllers/sellerController';

export const dynamic = 'force-dynamic';

// /api/sellers/bulk-import
export const POST = handle(protect, bulkImportSellers);
