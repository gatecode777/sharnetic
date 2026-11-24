import { handle } from '@/server/http';
import { login } from '@/server/controllers/adminAuthController';

export const dynamic = 'force-dynamic';

// /api/admin/login
export const POST = handle(login);
