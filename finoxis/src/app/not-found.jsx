import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <div className="app">
      <Header />
      <section className="container mx-auto px-6 max-w-7xl py-24 text-center">
        <p className="text-6xl font-extrabold text-blue-700">404</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Page not found</h1>
        <p className="mt-2 text-gray-500">The page you are looking for doesn&apos;t exist or has been moved.</p>
        <Link
          href="/"
          className="inline-flex items-center mt-8 px-6 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to Home
        </Link>
      </section>
      <Footer />
    </div>
  );
}
