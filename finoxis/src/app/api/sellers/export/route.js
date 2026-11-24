import { handle } from '@/server/http';
import { protect } from '@/server/middleware/adminAuth';
import { exportSellers } from '@/server/controllers/sellerController';

export const dynamic = 'force-dynamic';

// /api/sellers/export
export const GET = handle(protect, exportSellers);
