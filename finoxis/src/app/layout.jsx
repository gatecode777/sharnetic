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

export const metadata = {
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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
