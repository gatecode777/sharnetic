import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Public pages: same <div className="app"><Header />…<Footer /></div> wrapper the old App.jsx used.
export default function SiteLayout({ children }) {
  return (
    <div className="app">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
