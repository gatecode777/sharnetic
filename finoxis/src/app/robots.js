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
      // AI training crawler: may read the pages that describe the company, not the ~17,000 catalog pages.
      // ChatGPT search (OAI-SearchBot, ChatGPT-User) is not affected.
      { userAgent: 'GPTBot', allow: ['/$', '/about', '/contact', '/llms.txt'], disallow: '/' },
      // Brand-monitoring crawler with no search value.
      { userAgent: ['AwarioBot', 'AwarioSmartBot', 'AwarioRssBot'], disallow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
