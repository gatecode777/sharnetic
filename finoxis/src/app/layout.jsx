// Global styles — imported here once, in the same order the old Vite bundle applied them,
// so every page renders exactly as before.
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/templatemo.css';
import '@/styles/tailwind.min.css';
import '@/styles/about.css';
import '@/styles/productdetails.css';
import '@/styles/contact.css';
import '@/styles/auth.css';
import '@/styles/profile.css';
import '@/styles/admin/AdminLogin.css';
import '@/styles/admin/AdminLayout.css';
import '@/styles/admin/AdminDashboard.css';
import '@/styles/admin/AdminUsers.css';
import '@/styles/admin/AdminProducts.css';
import '@/styles/admin/ProductForm.css';
import '@/styles/admin/AdminCategories.css';
import '@/styles/admin/AdminOrders.css';
import '@/styles/admin/AdminProfile.css';
import '@/styles/index.css';

import Providers from './providers';
import { SITE_URL } from '@/lib/site';

export const metadata = {
  // Makes every relative canonical / Open Graph URL absolute (https://www.finoxis.org/...).
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Finoxis | B2B Marketplace & Verified Suppliers',
    template: '%s | Finoxis',
  },
  description: 'Finoxis - B2B Marketplace & Verified Indian Manufacturers Directory',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

/**
 * Pages are server-rendered, so an <img> can fail to load BEFORE React attaches its
 * onError handler (the one that swaps in /default-product.png etc.). That early error
 * would be lost and the browser's broken-image icon would show. This script records
 * such early failures and re-fires the error event once React owns the element, so
 * every existing onError fallback works exactly as it did with client-side rendering.
 */
const IMAGE_ERROR_REPLAY = `(function(){
  var isHydrated = function (el) {
    for (var k in el) { if (k.indexOf('__reactProps') === 0) return true; }
    return false;
  };
  document.addEventListener('error', function (e) {
    var img = e.target;
    if (!img || img.tagName !== 'IMG' || !e.isTrusted) return;
    if (img.__errorWatch === img.src) return;                      // already watching this failure
    var failedSrc = img.__errorWatch = img.src, tries = 0;
    var check = function () {
      // Stop once the element is gone, a fallback src was applied, or it loaded after all.
      if (!img.isConnected || img.src !== failedSrc || !(img.complete && img.naturalWidth === 0)) return;
      // React marks the element slightly before its error listener is live, so a replay can be
      // missed: keep handing the error to React until its onError has swapped the src.
      if (isHydrated(img)) img.dispatchEvent(new Event('error'));
      if (++tries < 200) setTimeout(check, 100);                   // up to ~20s
    };
    setTimeout(check, 50); // give React's own onError the first chance
  }, true);
})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: IMAGE_ERROR_REPLAY }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
