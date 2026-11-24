import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Any /api/* path without a dedicated route handler — same JSON 404 as the old Express server.
const notFound = () => NextResponse.json({ success: false, message: 'Route not found' }, { status: 404 });

export const GET = notFound;
export const POST = notFound;
export const PUT = notFound;
export const PATCH = notFound;
export const DELETE = notFound;
