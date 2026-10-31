// frontend/src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const ProductCard = ({ product, onEnquiry }) => {
  if (!product) return null;

  const imageUrl = product.images?.[0]?.url
    ? (product.images[0].url.startsWith('http')
        ? product.images[0].url
        : `${BASE_URL}/uploads/products/${product.images[0].url}`)
    : '/default-product.png';

  const seller = product.seller || {};
  const sellerName = seller.name || 'Verified Indian Manufacturer';
  const sellerCity = seller.city || 'India';
  const unit = product.unit || 'Piece';
  const moq = product.moq || '10 Pieces';

  const discount = product.pricing?.oldPrice && product.pricing.oldPrice > product.pricing.price
    ? Math.round(((product.pricing.oldPrice - product.pricing.price) / product.pricing.oldPrice) * 100)
    : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Product Image */}
        <div className="relative overflow-hidden bg-gray-50 h-52">
          <Link to={`/product/${product.slug}`} className="block h-full w-full">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-product.png';
              }}
            />
          </Link>

          {discount && (
            <span className="absolute top-2 right-2 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="p-4">
          {/* Category */}
          {product.category && (
            <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1">
              {typeof product.category === 'object' ? product.category.name : product.category}
            </div>
          )}

          {/* Product Title */}
          <Link to={`/product/${product.slug}`} className="block">
            <h3 className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-2 min-h-[40px] leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Price */}
          <div className="mt-2 mb-3 flex items-baseline justify-between border-b pb-2 border-gray-100">
            <div>
              <span className="text-lg font-bold text-gray-900">
                ₹{product.pricing?.price?.toLocaleString() || 'Contact for Price'}
              </span>
              <span className="text-xs text-gray-500 font-medium ml-1">/ {unit}</span>
            </div>
            {product.pricing?.oldPrice && (
              <span className="text-xs text-gray-400 line-through">
                ₹{product.pricing.oldPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Seller / Supplier Snapshot (IndiaMART Style) */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-gray-800 truncate block max-w-[180px]" title={sellerName}>
                <i className="fas fa-building text-blue-600 mr-1.5"></i>
                {sellerName}
              </span>
              {seller.rating && (
                <span className="bg-green-100 text-green-800 font-bold px-1.5 py-0.5 rounded text-[10px] flex items-center">
                  <i className="fas fa-star text-[9px] mr-1 text-green-600"></i>
                  {seller.rating}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-gray-500 text-[11px]">
              <span className="truncate">
                <i className="fas fa-map-marker-alt text-gray-400 mr-1"></i>
                {sellerCity}
              </span>
              {seller.isVerified !== false && (
                <span className="text-blue-700 font-semibold flex items-center text-[10px]">
                  <i className="fas fa-shield-alt text-blue-500 mr-1"></i> Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action CTA: ENQUIRY Button */}
      <div className="p-4 pt-0">
        <button
          onClick={() => onEnquiry(product)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg shadow hover:shadow-md transition-all flex items-center justify-center space-x-2 text-sm group-hover:bg-blue-700"
        >
          <i className="fas fa-envelope text-white"></i>
          <span>Send Enquiry</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

