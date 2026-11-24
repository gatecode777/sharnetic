import { handle } from '@/server/http';
import { protect } from '@/server/middleware/adminAuth';
import { createEnquiry, getAllEnquiries } from '@/server/controllers/enquiryController';

export const dynamic = 'force-dynamic';

// /api/enquiries
export const POST = handle(createEnquiry);
export const GET = handle(protect, getAllEnquiries);
