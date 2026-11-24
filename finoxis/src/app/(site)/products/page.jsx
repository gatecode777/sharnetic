import { Suspense } from 'react';
import Shop from '@/views/Shop';

export const metadata = { title: 'Products Directory' };

export default function Page() {
  // Reads URL search params on the client, so it needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <Shop />
    </Suspense>
  );
}
