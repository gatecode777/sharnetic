// components/MainHeader.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EnquiryModal from './EnquiryModal';

const MainHeader = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
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
      <div className="header-top py-2.5 hidden md:block bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 border-b border-blue-600/30">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex justify-between items-center text-white text-xs">
            <div className="flex items-center space-x-8">
              <span className="font-semibold text-yellow-300 flex items-center">
                <i className="fas fa-handshake mr-2"></i> Connect with Verified Indian Manufacturers & Suppliers
              </span>
              <Link to="/sellers" className="hover:text-yellow-200 transition flex items-center text-blue-100">
                <i className="fas fa-shield-alt mr-1.5 text-green-400"></i> Verified Suppliers
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              {!isLoggedIn ? (
                <>
                  <Link to="/register" className="hover:text-yellow-200 transition">
                    <i className="fas fa-user-plus mr-1.5"></i> Register
                  </Link>
                  <Link to="/login" className="hover:text-yellow-200 transition">
                    <i className="fas fa-sign-in-alt mr-1.5"></i> Login
                  </Link>
                </>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 hover:underline focus:outline-none"
                  >
                    <i className="fas fa-user-circle mr-1 text-sm"></i>
                    <span>Hello, {user?.name?.split(' ')[0] || 'User'}</span>
                    <i className={`fas fa-chevron-${isDropdownOpen ? 'up' : 'down'} text-[10px] ml-1`}></i>
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl py-2 z-50 text-gray-800 border border-gray-100" style={{ zIndex: '99' }}>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <i className="fas fa-user mr-2 text-blue-600"></i> My Profile
                      </Link>
                      <hr className="my-1.5 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
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

      {/* Main Header with Generous Spacing */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 max-w-7xl middle-header-wrapper" style={{ paddingTop: '22px', paddingBottom: '22px' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 lg:gap-8">
            
            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0 hover:opacity-95 transition">
              <img
                src="/sharnetic_logo.png"
                alt="Sharnetic"
                style={{ height: '46px', width: 'auto' }}
                className="h-11 md:h-12 w-auto object-contain"
              />
            </Link>

            {/* Search Bar - Modern Inset Design with Breathing Space */}
            <div className="w-full md:flex-1 max-w-2xl mx-auto px-0 md:px-4">
              <form onSubmit={handleSearch} className="search-container-modern">
                <div className="search-category-pill hidden sm:flex">
                  <i className="fas fa-search mr-2 text-blue-600"></i>
                  <span>All Products</span>
                </div>
                <input
                  type="text"
                  placeholder="Enter product name, category, or manufacturer..."
                  className="search-input-field"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  type="submit"
                  className="search-submit-btn"
                >
                  <i className="fas fa-search text-xs"></i>
                  <span>Search</span>
                </button>
              </form>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsRequirementModalOpen(true)}
                className="btn-requirement"
              >
                <i className="fas fa-edit text-sm"></i>
                <span>Post Requirement</span>
              </button>

              {!isLoggedIn && (
                <Link 
                  to="/login" 
                  className="btn-header-login"
                >
                  <i className="fas fa-user-circle text-sm text-gray-500"></i>
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Menu with Spacious Row & Padding */}
        <div className="border-t border-gray-200 bg-gray-50/80">
          <div className="container mx-auto px-6 py-3 max-w-7xl">
            <div className="flex flex-wrap items-center justify-between text-xs font-bold tracking-wide">
              <div className="flex flex-wrap items-center space-x-8 py-1">
                <Link to="/" className="text-gray-700 hover:text-blue-600 transition flex items-center">
                  <i className="fas fa-home mr-1.5 text-gray-400"></i> Home
                </Link>
                <Link to="/shop" className="text-gray-700 hover:text-blue-600 transition flex items-center">
                  <i className="fas fa-th-large mr-1.5 text-gray-400"></i> Products Directory
                </Link>
                <Link to="/sellers" className="text-blue-700 hover:text-blue-900 transition flex items-center">
                  <i className="fas fa-industry mr-1.5 text-blue-600"></i> Verified Suppliers
                </Link>
                <Link to="/about" className="text-gray-700 hover:text-blue-600 transition">
                  About Us
                </Link>
                <Link to="/contact" className="text-gray-700 hover:text-blue-600 transition">
                  Contact
                </Link>
              </div>
              <div className="hidden lg:flex items-center text-gray-500 space-x-6">
                <span className="flex items-center">
                  <i className="fas fa-check-double text-green-600 mr-1.5"></i> Verified Trade Leads
                </span>
                <span className="flex items-center">
                  <i className="fas fa-headset text-blue-600 mr-1.5"></i> 24/7 Buyer Support
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Global Post Requirement Modal */}
      <EnquiryModal
        isOpen={isRequirementModalOpen}
        onClose={() => setIsRequirementModalOpen(false)}
        product={null}
        seller={null}
        initialMessage="I am looking for bulk products/materials. Please connect me with verified suppliers."
      />
    </>
  );
};

export default MainHeader;
