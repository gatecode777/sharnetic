import { handle } from '@/server/http';
import { protect } from '@/server/middleware/adminAuth';
import { toggleActive } from '@/server/controllers/adminProductController';

export const dynamic = 'force-dynamic';

// /api/admin/products/[id]/toggle-active
export const PUT = handle(protect, toggleActive);
