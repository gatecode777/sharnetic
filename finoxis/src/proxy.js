import { NextResponse } from 'next/server';

/**
 * CORS for /api/* — same allow-list the old Express server used.
 * Not needed for the Next.js frontend itself (same origin), but keeps the API
 * usable from other clients (local tools, Vercel previews, CLIENT_URL).
 */
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', process.env.CLIENT_URL].filter(Boolean);

const isAllowedOrigin = (origin) =>
  allowedOrigins.includes(origin) ||
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
  /\.vercel\.app$/.test(origin);

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  Vary: 'Origin',
});

export function proxy(request) {
  const origin = request.headers.get('origin');
  const allowed = origin && isAllowedOrigin(origin);

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: allowed ? corsHeaders(origin) : {} });
  }

  const response = NextResponse.next();
  if (allowed) {
    for (const [key, value] of Object.entries(corsHeaders(origin))) response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
