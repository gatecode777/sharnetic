import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/health
export function GET() {
  return NextResponse.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
}
