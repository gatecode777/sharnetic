import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import SellersPage from './pages/Sellers';
import SellerDetailPage from './pages/SellerDetail';
import Contact from './pages/Contact';
import TermsAndConditions from './pages/TermsAndCondition';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import CancellationPolicy from './pages/CancellationPolicy';

import Login from './pages/Login';
import Register from './pages/Register';
import ScrollToTop from './components/ScrollToTop';
import ProfilePage from './pages/Profile';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import ProductForm from './pages/admin/ProductForm';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminEnquiries from './pages/admin/AdminEnquiries';
import AdminSellers from './pages/admin/AdminSellers';
import AdminProfile from './pages/admin/AdminProfile';

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          path="/login"
          element={
            <div className="app">
              <Login />
            </div>
          }
        />
        <Route
          path="/register"
          element={
            <div className="app">
              <Register />
            </div>
          }
        />
        <Route
          path="/profile"
          element={
            <div className="app">
              <Header />
              <ProfilePage />
              <Footer />
            </div>
          }
        />
        <Route
          path="/"
          element={
            <div className="app">
              <Header />
              <Home />
              <Footer />
            </div>
          }
        />
        <Route
          path="/about"
          element={
            <div className="app">
              <Header />
              <About />
              <Footer />
            </div>
          }
        />
        <Route
          path="/shop"
          element={
            <div className="app">
              <Header />
              <Shop />
              <Footer />
            </div>
          }
        />
        <Route
          path="/products"
          element={
            <div className="app">
              <Header />
              <Shop />
              <Footer />
            </div>
          }
        />
        <Route
          path="/product/:slug"
          element={
            <div className="app">
              <Header />
              <ProductDetails />
              <Footer />
            </div>
          }
        />
        <Route
          path="/sellers"
          element={
            <div className="app">
              <Header />
              <SellersPage />
              <Footer />
            </div>
          }
        />
        <Route
          path="/seller/:id"
          element={
            <div className="app">
              <Header />
              <SellerDetailPage />
              <Footer />
            </div>
          }
        />
        <Route
          path="/contact"
          element={
            <div className="app">
              <Header />
              <Contact />
              <Footer />
            </div>
          }
        />
        <Route
          path="/terms-and-condition"
          element={
            <div className="app">
              <Header />
              <TermsAndConditions />
              <Footer />
            </div>
          }
        />
        <Route
          path="/privacy-policy"
          element={
            <div className="app">
              <Header />
              <PrivacyPolicy />
              <Footer />
            </div>
          }
        />
        <Route
          path="/refund-policy"
          element={
            <div className="app">
              <Header />
              <RefundPolicy />
              <Footer />
            </div>
          }
        />
        <Route
          path="/cancellation-policy"
          element={
            <div className="app">
              <Header />
              <CancellationPolicy />
              <Footer />
            </div>
          }
        />

        {/* E-commerce Deprecated Redirects */}
        <Route path="/cart" element={<Navigate to="/shop" replace />} />
        <Route path="/checkout" element={<Navigate to="/shop" replace />} />
        <Route path="/orders/:id" element={<Navigate to="/profile" replace />} />

        {/* Admin Routes (No Header/Footer) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/enquiries" element={<AdminEnquiries />} />
        <Route path="/admin/sellers" element={<AdminSellers />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/products/new" element={<ProductForm />} />
        <Route path="/admin/products/edit/:id" element={<ProductForm />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
      </Routes>
    </>
  );
}

export default App;
