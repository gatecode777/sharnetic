import { handle } from '@/server/http';
import { userProtect } from '@/server/middleware/userAuth';
import { profileUpload } from '@/server/upload';
import { getProfile, updateProfile } from '@/server/controllers/userController';

export const dynamic = 'force-dynamic';

// /api/users/profile
export const GET = handle(userProtect, getProfile);
export const PUT = handle(userProtect, profileUpload.single('profile'), updateProfile);
