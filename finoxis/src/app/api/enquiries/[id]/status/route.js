import { handle } from '@/server/http';
import { protect } from '@/server/middleware/adminAuth';
import { updateEnquiryStatus } from '@/server/controllers/enquiryController';

export const dynamic = 'force-dynamic';

// /api/enquiries/[id]/status
export const PUT = handle(protect, updateEnquiryStatus);
