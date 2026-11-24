'use client';

import { ToastContainer } from 'react-toastify';
import { ToastProvider } from '@/components/Toast';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import ScrollToTop from '@/components/ScrollToTop';

// Same provider order as the old main.jsx:
// ToastProvider > AuthProvider > CartProvider (CartProvider uses both useToast and useAuth).
export default function Providers({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          {children}
          {/* react-toastify is used by the admin Categories page */}
          <ToastContainer position="top-right" autoClose={3000} />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
