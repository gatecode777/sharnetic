import { handle } from '@/server/http';
import { login } from '@/server/controllers/userController';

export const dynamic = 'force-dynamic';

// /api/users/login
export const POST = handle(login);
