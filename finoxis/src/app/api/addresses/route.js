import { handle } from '@/server/http';
import { userProtect } from '@/server/middleware/userAuth';
import { getAll, create } from '@/server/controllers/addressController';

export const dynamic = 'force-dynamic';

// /api/addresses
export const GET = handle(userProtect, getAll);
export const POST = handle(userProtect, create);
