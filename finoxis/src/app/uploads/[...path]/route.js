import fs from 'node:fs';
import path from 'node:path';
import { UPLOAD_ROOT } from '@/server/upload';

export const dynamic = 'force-dynamic';

const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
};

// Same fallbacks the Express server had for missing images.
const FALLBACKS = {
  products: 'products/default-product.png',
  categories: 'categories/default-category.png',
};

const fileResponse = async (filePath) => {
  const data = await fs.promises.readFile(filePath);
  const type = MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
  return new Response(data, {
    headers: {
      'Content-Type': type,
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};

const isFile = (p) => {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
};

// GET /uploads/<folder>/<filename>
// Uploaded files are written at runtime, so they are served from disk here
// rather than from /public (which Next.js only serves for build-time files).
export async function GET(request, { params }) {
  const segments = (await params).path || [];
  const resolved = path.resolve(/*turbopackIgnore: true*/ UPLOAD_ROOT, ...segments);

  // Block path traversal outside the upload root.
  const insideRoot = resolved === UPLOAD_ROOT || resolved.startsWith(UPLOAD_ROOT + path.sep);

  if (insideRoot && isFile(resolved)) {
    return fileResponse(resolved);
  }

  const fallback = FALLBACKS[segments[0]];
  if (fallback) {
    const fallbackPath = path.join(/*turbopackIgnore: true*/ UPLOAD_ROOT, fallback);
    if (isFile(fallbackPath)) return fileResponse(fallbackPath);
  }

  return new Response('Not Found', { status: 404 });
}
