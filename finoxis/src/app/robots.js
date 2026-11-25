import { SITE_URL } from '@/lib/site';

// Served at /robots.txt
const disallow = ['/admin', '/api/', '/profile', '/login', '/register', '/cart', '/checkout', '/orders'];

// Search and AI-search crawlers we explicitly welcome. A crawler that has its own group
// ignores the "*" group, so each one gets the same allow/disallow list.
const namedBots = ['Googlebot', 'Google-Extended', 'Bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot'];

export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      ...namedBots.map((userAgent) => ({ userAgent, allow: '/', disallow })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
