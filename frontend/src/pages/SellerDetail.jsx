// frontend/src/pages/SellerDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sellerAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import EnquiryModal from '../components/EnquiryModal';

const SellerDetailPage = () => {
  const { id } = useParams();

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Enquiry Modal
  const [enquiryProduct, setEnquiryProduct] = useState(null);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await sellerAPI.getById(id);
        if (res.data.success) {
          setSeller(res.data.seller);
          setProducts(res.data.products || []);
        } else {
          setError('Supplier not found');
        }
      } catch (err) {
        console.error('Fetch seller detail error:', err);
        setError(err.response?.data?.message || 'Failed to load supplier');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSellerData();
    }
  }, [id]);

  const handleOpenProductEnquiry = (product) => {
    setEnquiryProduct(product);
    setIsEnquiryOpen(true);
  };

  const handleOpenGeneralEnquiry = () => {
    setEnquiryProduct(null);
    setIsEnquiryOpen(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-3"></i>
        <p className="text-gray-600 text-sm font-semibold">Loading supplier catalog...</p>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-gray-200">
          <i className="fas fa-exclamation-circle text-4xl text-red-500 mb-3"></i>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Supplier Not Found</h2>
          <p className="text-sm text-gray-600 mb-6">{error || 'Supplier details unavailable.'}</p>
          <Link to="/sellers" className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm">
            View All Suppliers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-500 mb-6 flex items-center space-x-2">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link to="/sellers" className="hover:text-blue-600">Suppliers</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">{seller.name}</span>
        </div>

        {/* Seller Profile Banner */}
        <div className="bg-white rounded-2xl border-2 border-blue-500 p-8 mb-10 shadow-md">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  Main Category: {seller.mainCategory?.name || 'Verified Supplier'}
                </span>
                {seller.isVerified && (
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full flex items-center">
                    <i className="fas fa-shield-alt mr-1 text-green-600"></i> GST Verified Supplier
                  </span>
                )}
                {seller.trustSeal && (
                  <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full flex items-center">
                    <i className="fas fa-award mr-1 text-purple-600"></i> TrustSeal
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2 mb-3">
                {seller.name}
              </h1>

              <p className="text-gray-700 text-sm max-w-3xl leading-relaxed mb-4">
                {seller.description || 'Verified manufacturer offering bulk wholesale catalog with assured delivery.'}
              </p>

              {/* Badges / Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-gray-500 block">Location:</span>
                  <strong className="text-gray-800">{seller.city}, {seller.state}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Business Type:</span>
                  <strong className="text-gray-800">{seller.businessType}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Established:</span>
                  <strong className="text-gray-800">{seller.yearEstablished || '2015'}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Supplier Rating:</span>
                  <strong className="text-amber-700 flex items-center">
                    <i className="fas fa-star text-amber-500 mr-1 text-xs"></i>
                    {seller.rating} / 5 ({seller.totalRatings || 45} Reviews)
                  </strong>
                </div>
              </div>
            </div>

            {/* Quick Contact Box */}
            <div className="w-full md:w-72 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 text-xs flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-3">Direct Contact</h4>
                <div className="space-y-2 text-gray-700 mb-4">
                  <div>
                    <span className="text-gray-500 block">Contact Person:</span>
                    <strong className="text-gray-900">{seller.contactPerson || 'Sales Department'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Phone / WhatsApp:</span>
                    <strong className="text-blue-700 font-mono text-sm">{seller.phone || '+91 98290 12345'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Email:</span>
                    <span className="text-gray-800 font-medium">{seller.email || 'sales@supplier.com'}</span>
                  </div>
                  {seller.gstin && (
                    <div>
                      <span className="text-gray-500 block">GSTIN:</span>
                      <strong className="font-mono text-gray-800">{seller.gstin}</strong>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleOpenGeneralEnquiry}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow transition flex items-center justify-center space-x-2"
              >
                <i className="fas fa-paper-plane"></i>
                <span>Send Requirement</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Catalog Heading */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              Product Catalog from {seller.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Showing all {products.length} wholesale products supplied directly by this manufacturer
            </p>
          </div>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8">
            <i className="fas fa-boxes text-5xl text-gray-300 mb-3"></i>
            <h3 className="text-base font-bold text-gray-800">No Products Listed Yet</h3>
            <p className="text-xs text-gray-500 mt-1">This supplier is currently updating their product line.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={{ ...product, seller }}
                onEnquiry={handleOpenProductEnquiry}
              />
            ))}
          </div>
        )}
      </div>

      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        product={enquiryProduct}
        seller={seller}
      />
    </div>
  );
};

export default SellerDetailPage;

