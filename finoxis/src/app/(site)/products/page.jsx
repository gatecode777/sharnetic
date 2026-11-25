import { permanentRedirect } from 'next/navigation';

// Old alias of /shop: permanently redirect, keeping any filters (?category=, ?page=, ...).
export default async function Page({ searchParams }) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    for (const v of [].concat(value)) qs.append(key, v);
  }
  const s = qs.toString();
  permanentRedirect(s ? `/shop?${s}` : '/shop');
}
