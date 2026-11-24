// Central API configuration.
// By default the API is served by this same Next.js app at /api, so no env var is needed.
// Set NEXT_PUBLIC_API_URL only if you host the API on a different origin.
export const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Origin that serves /uploads/* (empty string = same origin).
export const BASE_URL = API_URL.replace(/\/api\/?$/, '');
