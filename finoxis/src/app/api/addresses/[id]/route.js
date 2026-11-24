import { handle } from '@/server/http';
import { userProtect } from '@/server/middleware/userAuth';
import { getOne, update, remove } from '@/server/controllers/addressController';

export const dynamic = 'force-dynamic';

// /api/addresses/[id]
export const GET = handle(userProtect, getOne);
export const PUT = handle(userProtect, update);
export const DELETE = handle(userProtect, remove);
