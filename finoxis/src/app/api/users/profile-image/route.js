import { handle } from '@/server/http';
import { userProtect } from '@/server/middleware/userAuth';
import { deleteProfileImage } from '@/server/controllers/userController';

export const dynamic = 'force-dynamic';

// /api/users/profile-image
export const DELETE = handle(userProtect, deleteProfileImage);
