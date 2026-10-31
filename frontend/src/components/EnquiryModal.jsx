// frontend/src/components/EnquiryModal.jsx
import React, { useState, useEffect } from 'react';
import { enquiryAPI } from '../services/api';

const EnquiryModal = ({ isOpen, onClose, product, seller, initialMessage = '' }) => {
  const [formData, setFormData] = useState({
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    quantity: '25 Pieces',
    city: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Prefill user details if logged in
  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setError('');
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setFormData((prev) => ({
          ...prev,
          buyerName: storedUser.name || prev.buyerName,
          buyerEmail: storedUser.email || prev.buyerEmail,
          buyerPhone: storedUser.phone || prev.buyerPhone,
          city: storedUser.city || prev.city,
          quantity: product?.moq || '25 Pieces',
          message: initialMessage || (product ? `I am interested in ${product.name}. Please share wholesale price and minimum delivery time.` : ''),
        }));
      } catch (e) {
        // Ignore JSON error
      }
    }
  }, [isOpen, product, initialMessage]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.buyerName.trim() || !formData.buyerPhone.trim() || !formData.buyerEmail.trim()) {
      setError('Please fill in your name, phone number, and email.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        product: product?._id || null,
        productName: product?.name || 'General Buying Requirement',
        seller: seller?._id || product?.seller?._id || null,
        sellerName: seller?.name || product?.seller?.name || '',
        buyerName: formData.buyerName,
        buyerEmail: formData.buyerEmail,
        buyerPhone: formData.buyerPhone,
        quantity: formData.quantity,
        city: formData.city,
        message: formData.message,
      };

      const response = await enquiryAPI.create(payload);

      if (response.data.success) {
        setSuccess(true);
      } else {
        setError(response.data.message || 'Failed to submit enquiry');
      }
    } catch (err) {
      console.error('Submit enquiry error:', err);
      setError(err.response?.data?.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sellerName = seller?.name || product?.seller?.name || 'Verified Supplier';
  const sellerCity = seller?.city || product?.seller?.city || 'India';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 transform transition-all">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="fas fa-paper-plane text-yellow-300"></i>
            <h3 className="text-lg font-bold">
              {product ? 'Send Buying Requirement' : 'Post Buy Requirement'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-semibold leading-none focus:outline-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[85vh] overflow-y-auto">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                <i className="fas fa-check"></i>
              </div>
              <h4 className="text-2xl font-bold text-gray-800 mb-2">Requirement Submitted!</h4>
              <p className="text-gray-600 mb-2">
                Your enquiry has been delivered directly to:
              </p>
              <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 my-2 text-blue-900 font-semibold text-sm">
                <i className="fas fa-building mr-2 text-blue-600"></i>
                {sellerName} ({sellerCity})
              </div>
              <p className="text-xs text-gray-500 mt-2 mb-6">
                The seller will contact you shortly via Call or WhatsApp with price quotes and delivery terms.
              </p>
              <button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Product & Seller Snapshot */}
              {product && (
                <div className="flex items-center space-x-4 bg-gray-50 p-3 rounded-xl border border-gray-200 mb-4">
                  <img
                    src={
                      product.images?.[0]?.url
                        ? (product.images[0].url.startsWith('http')
                            ? product.images[0].url
                            : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/products/${product.images[0].url}`)
                        : '/default-product.png'
                    }
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg border bg-white flex-shrink-0"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/default-product.png'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate">{product.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-blue-700 font-bold text-sm">
                        ₹{product.pricing?.price?.toLocaleString() || 'Contact for Price'}
                      </span>
                      {product.moq && (
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                          MOQ: {product.moq}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 flex items-center truncate">
                      <i className="fas fa-check-circle text-green-500 mr-1"></i>
                      <span>Supplier: <strong className="text-gray-800">{sellerName}</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4 flex items-center">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="buyerName"
                      required
                      placeholder="e.g. Ramesh Patel"
                      value={formData.buyerName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Mobile / WhatsApp *
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-sm text-gray-600 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg font-medium">
                        +91
                      </span>
                      <input
                        type="tel"
                        name="buyerPhone"
                        required
                        placeholder="9876543210"
                        value={formData.buyerPhone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="buyerEmail"
                      required
                      placeholder="name@business.com"
                      value={formData.buyerEmail}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Requirement Quantity
                    </label>
                    <input
                      type="text"
                      name="quantity"
                      placeholder="e.g. 50 Pieces / 100 Kg"
                      value={formData.quantity}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Delivery City
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="e.g. Jaipur, Delhi, Mumbai"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Requirement Details / Message
                  </label>
                  <textarea
                    name="message"
                    rows="3"
                    placeholder="Describe your requirement, size/specifications, target price, or urgent delivery date..."
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Connecting with Supplier...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        <span>Send Enquiry to Supplier</span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-[11px] text-gray-500 mt-2">
                    <i className="fas fa-lock mr-1"></i> Your details are safe with us. Suppliers will contact you directly.
                  </p>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnquiryModal;

