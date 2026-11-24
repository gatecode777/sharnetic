import { handle } from '@/server/http';
import { protect } from '@/server/middleware/adminAuth';
import { getSellerById, updateSeller, deleteSeller } from '@/server/controllers/sellerController';

export const dynamic = 'force-dynamic';

// /api/sellers/[id]
export const GET = handle(getSellerById);
export const PUT = handle(protect, updateSeller);
export const DELETE = handle(protect, deleteSeller);
