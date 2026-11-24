import { Suspense } from 'react';
import SellersPage from '@/views/Sellers';

export const metadata = { title: 'Verified Suppliers' };

export default function Page() {
  // Reads URL search params on the client, so it needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <SellersPage />
    </Suspense>
  );
}
