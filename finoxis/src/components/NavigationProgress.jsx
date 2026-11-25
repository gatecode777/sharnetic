'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Thin progress bar at the top of the screen that starts the instant an internal link is
 * clicked and finishes when the new page is on screen — immediate feedback on every click.
 *
 * Purely client-side on purpose: a route-level loading.jsx would make the server send
 * "200 OK" before a page can issue its 308 redirect / 404, which breaks SEO redirects.
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const [state, setState] = useState('idle'); // idle | loading | done
  const timer = useRef(null);

  // Start on click of an internal link that goes to a different page.
  useEffect(() => {
    const onClick = (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
      if (!a || a.hasAttribute('download') || (a.target && a.target !== '_self')) return;
      let url;
      try {
        url = new URL(a.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return; // same page / #hash
      setState('loading');
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  // The URL changed => the new page is showing.
  useEffect(() => {
    setState((s) => (s === 'loading' ? 'done' : s));
  }, [pathname, query]);

  // Fade out after finishing; never get stuck if a navigation is cancelled.
  useEffect(() => {
    clearTimeout(timer.current);
    if (state === 'done') timer.current = setTimeout(() => setState('idle'), 400);
    if (state === 'loading') timer.current = setTimeout(() => setState('idle'), 15000);
    return () => clearTimeout(timer.current);
  }, [state]);

  if (state === 'idle') return null;
  return (
    <div
      aria-hidden="true"
      className={`nav-progress ${state === 'done' ? 'nav-progress--done' : ''}`}
    />
  );
}
