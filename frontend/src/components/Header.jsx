// components/MainHeader.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const MainHeader = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout, isLoggedIn } = useAuth();
  const { cartCount } = useCart(); // Get cart count from context
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Top Header */}
      <div className="header-top py-2 hidden md:block bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-white text-sm">
            <div className="flex items-center space-x-6">
              <Link to="/sell" className="hover:underline">
                <i className="fas fa-briefcase mr-1"></i> Sell on Sharnetic
              </Link>
              <Link to="/help" className="hover:underline">
                <i className="fas fa-question-circle mr-1"></i> Help
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              {!isLoggedIn ? (
                <>
                  <Link to="/register" className="hover:underline">
                    <i className="fas fa-user-plus mr-1"></i> Sign Up
                  </Link>
                  <Link to="/login" className="hover:underline">
                    <i className="fas fa-sign-in-alt mr-1"></i> Login
                  </Link>
                </>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 hover:underline focus:outline-none"
                  >
                    <i className="fas fa-user-circle mr-1"></i>
                    <span>Hello, {user?.name?.split(' ')[0] || 'User'}</span>
                    <i className={`fas fa-chevron-${isDropdownOpen ? 'up' : 'down'} text-xs ml-1`}></i>
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50" style={{zIndex:'99'}}>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <i className="fas fa-user mr-2"></i> My Profile
                      </Link>
                      {/* <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <i className="fas fa-shopping-bag mr-2"></i> My Orders
                      </Link> */}
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <i className="fas fa-sign-out-alt mr-2"></i> Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src="/sharnetic_logo.png"
                alt="Sharnetic Logo"
                className="h-12 mr-2"
              />
            </Link>

            {/* Search Bar */}
            <div className="w-full md:w-2/5">
              <form onSubmit={handleSearch} className="search-box flex items-center bg-white rounded border border-gray-300">
                <input
                  type="text"
                  placeholder="Search for products, brands and more"
                  className="w-full px-4 py-3 text-gray-700 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  <i className="fas fa-search"></i>
                </button>
              </form>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-6">
              {!isLoggedIn ? (
                <Link 
                  to="/login" 
                  className="login-btn px-6 py-2 bg-blue-600 text-dark rounded hover:bg-blue-700 transition flex items-center"
                >
                  <i className="fas fa-user mr-2"></i>
                  <span>Login</span>
                </Link>
              ) : null}
              
              {/* Cart Icon - Show for all users */}
              <Link to="/cart" className="text-gray-700 hover:text-blue-600 relative">
                <i className="fas fa-shopping-cart text-2xl"></i>
                {cartCount > 0 && (
                  <span className="cart-badge absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
                <span className="text-sm font-medium block mt-1">Cart</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-between py-2">
              <div className="flex flex-wrap space-x-6">
                <Link to="/" className="nav-link text-gray-700 hover:text-blue-600">Home</Link>
                <Link to="/shop" className="nav-link text-gray-700 hover:text-blue-600">Shop</Link>
                <Link to="/" className="nav-link text-gray-700 hover:text-blue-600">Categories</Link>
                <Link to="/" className="nav-link text-gray-700 hover:text-blue-600">Today's Deals</Link>
                <Link to="/about" className="nav-link text-gray-700 hover:text-blue-600">About</Link>
                <Link to="/contact" className="nav-link text-gray-700 hover:text-blue-600">Contact</Link>
              </div>
              <div className="text-sm text-gray-500">
                <i className="fas fa-map-marker-alt mr-1"></i>
                Deliver to: <span className="font-medium">Jaipur 302020</span>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default MainHeader;