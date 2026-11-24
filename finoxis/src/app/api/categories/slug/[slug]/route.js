import { handle } from '@/server/http';
import { getCategoryBySlug } from '@/server/controllers/categoryController';

export const dynamic = 'force-dynamic';

// /api/categories/slug/[slug]
export const GET = handle(getCategoryBySlug);
