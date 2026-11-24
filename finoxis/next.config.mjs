import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // This app lives inside a larger repo; pin the root so Turbopack/tracing stay inside finoxis/.
  turbopack: { root: projectRoot },
  outputFileTracingRoot: projectRoot,

  // Mongoose and friends must run as native Node modules, never bundled.
  serverExternalPackages: ['mongoose', 'bcryptjs', 'jsonwebtoken'],

  // Deprecated e-commerce routes (same behaviour as the old React Router <Navigate replace />).
  async redirects() {
    return [
      { source: '/cart', destination: '/shop', permanent: false },
      { source: '/checkout', destination: '/shop', permanent: false },
      { source: '/orders/:id', destination: '/profile', permanent: false },
    ];
  },
};

export default nextConfig;
