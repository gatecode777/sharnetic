// src/lib/imageHelper.js

import { BASE_URL } from './config';

/**
 * Format any product image (raw string, object with url, local upload, or external CDN)
 * to a secure, reliable, browser-renderable HTTPS URL.
 */
export const formatImageUrl = (rawImage) => {
  if (!rawImage) return '/default-product.png';

  let url = typeof rawImage === 'string' ? rawImage : rawImage.url;
  if (!url || typeof url !== 'string') return '/default-product.png';

  url = url.trim();

  // 0. Hosts that never answer (connections hang, so onError never fires and the card stays blank).
  //    Used by the eBook covers. Show the default image straight away instead.
  if (/^https?:\/\/static0\d\.digital\.flipkart\.com\//i.test(url)) {
    return '/default-product.png';
  }

  // 1. Upgrade Flipkart legacy HTTP CDNs (img5a/img6a) to Flipkart's official secure CDN (rukminim1)
  if (/https?:\/\/img[0-9]a\.flixcart\.com/i.test(url)) {
    return url.replace(/https?:\/\/img[0-9]a\.flixcart\.com/i, 'https://rukminim1.flixcart.com');
  }

  // 2. Absolute URL handling
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // On production HTTPS deployments (e.g. Vercel), avoid mixed-content blocks by upgrading http to https
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http://')) {
      return url.replace(/^http:\/\//i, 'https://');
    }
    return url;
  }

  // 3. Fallback for uploaded backend file names
  return `${BASE_URL}/uploads/products/${url}`;
};

