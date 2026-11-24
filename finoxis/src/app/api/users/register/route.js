import { handle } from '@/server/http';
import { register } from '@/server/controllers/userController';

export const dynamic = 'force-dynamic';

// /api/users/register
export const POST = handle(register);
