import { Suspense } from 'react';
import Login from '@/views/Login';

export const metadata = { title: 'Login' };

export default function Page() {
  // Reads URL search params on the client, so it needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}
