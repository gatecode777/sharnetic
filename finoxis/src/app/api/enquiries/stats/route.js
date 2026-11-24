import { handle } from '@/server/http';
import { protect } from '@/server/middleware/adminAuth';
import { getStats } from '@/server/controllers/enquiryController';

export const dynamic = 'force-dynamic';

// /api/enquiries/stats
export const GET = handle(protect, getStats);
