import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NavigationProgress from '@/components/NavigationProgress';

// Public pages: same <div className="app"><Header />…<Footer /></div> wrapper the old App.jsx used.
export default function SiteLayout({ children }) {
  return (
    <div className="app">
      {/* Browser-only progress bar (reads the URL, so it sits in its own Suspense boundary). */}
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      <Header />
      {children}
      <Footer />
    </div>
  );
}
