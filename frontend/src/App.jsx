import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Shop from './pages/Shop';
import Contact from './pages/Contact';
import TermsAndConditions from './pages/TermsAndCondition';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import CancellationPolicy from './pages/CancellationPolicy';

import Login from './pages/Login';
import Register from './pages/Register';
import ScrollToTop from './components/ScrollToTop';
import CartPage from './pages/Cart';
import CheckoutPage from './pages/Checkout';
import ProfilePage from './pages/Profile';
import OrderDetails from './pages/OrderDetail';


// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import ProductForm from './pages/admin/ProductForm';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
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
          path="/cart"
          element={
            <div className="app">
              <Header />
              <CartPage />
              <Footer />
            </div>
          }
        />
        <Route
          path="/checkout"
          element={
            <div className="app">
              <Header />
              <CheckoutPage />
              <Footer />
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
          path="/orders/:id"
          element={
            <div className="app">
              <Header />
              <OrderDetails />
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


        {/* Admin Routes (No Header/Footer) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
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
