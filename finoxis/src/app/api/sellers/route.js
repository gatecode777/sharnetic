import { handle } from '@/server/http';
import { protect } from '@/server/middleware/adminAuth';
import { getAllSellers, createSeller } from '@/server/controllers/sellerController';

export const dynamic = 'force-dynamic';

// /api/sellers
export const GET = handle(getAllSellers);
export const POST = handle(protect, createSeller);
