import { handle } from '@/server/http';
import { protect } from '@/server/middleware/adminAuth';
import { toggleInStock } from '@/server/controllers/adminProductController';

export const dynamic = 'force-dynamic';

// /api/admin/products/[id]/toggle-instock
export const PUT = handle(protect, toggleInStock);
