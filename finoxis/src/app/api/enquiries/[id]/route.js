import { handle } from '@/server/http';
import { protect } from '@/server/middleware/adminAuth';
import { getEnquiryById, deleteEnquiry } from '@/server/controllers/enquiryController';

export const dynamic = 'force-dynamic';

// /api/enquiries/[id]
export const GET = handle(protect, getEnquiryById);
export const DELETE = handle(protect, deleteEnquiry);
