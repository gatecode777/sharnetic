'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Scroll to the top of the page whenever the route changes (same as the old React Router helper).
function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
