import { handle } from '@/server/http';
import { userProtect } from '@/server/middleware/userAuth';
import { setDefault } from '@/server/controllers/addressController';

export const dynamic = 'force-dynamic';

// /api/addresses/[id]/default
export const PUT = handle(userProtect, setDefault);
