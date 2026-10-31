// frontend/src/pages/ProductDetails.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import EnquiryModal from '../components/EnquiryModal';
import '../assets/css/productdetails.css';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const ProductDetails = () => {
  const { slug } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  const getProductImage = (prod, imageIndex = 0) => {
    if (prod?.images?.length > 0 && prod.images[imageIndex]) {
      const img = prod.images[imageIndex];
      const url = typeof img === 'string' ? img : img?.url;
      if (!url) return '/default-product.png';
      return url.startsWith('http') ? url : `${BASE_URL}/uploads/products/${url}`;
    }
    return '/default-product.png';
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await productAPI.getBySlug(slug);
        
        if (response.data.success) {
          const currentProd = response.data.product;
          setProduct(currentProd);
          
          // Fetch related products
          const catId = currentProd.category?._id || currentProd.category;
          if (catId) {
            try {
              const relRes = await productAPI.getAll({ category: catId, limit: 5 });
              if (relRes.data.success) {
                setRelatedProducts(
                  relRes.data.products.filter((p) => p._id !== currentProd._id).slice(0, 4)
                );
              }
            } catch (e) {
              console.error('Related products fetch error:', e);
            }
          }
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError(err.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-3"></i>
        <p className="text-gray-600 font-semibold text-sm">Loading product & supplier details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <i className="fas fa-exclamation-circle text-4xl text-red-500 mb-3"></i>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-sm text-gray-600 mb-6">{error || "The product you're looking for does not exist."}</p>
          <Link to="/shop" className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-blue-700 transition">
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  const seller = product.seller || {};
  const sellerName = seller.name || 'Verified Indian Manufacturer';
  const unit = product.unit || 'Piece';
  const moq = product.moq || '10 Pieces';

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-500 mb-6 flex items-center space-x-2">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-blue-600">Products</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link to={`/shop?category=${product.category._id}`} className="hover:text-blue-600">
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-900 font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Main Product Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Left: Product Images (4 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="h-96 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 mb-4 flex items-center justify-center relative">
                <img
                  src={getProductImage(product, selectedImage)}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-product.png';
                  }}
                />
              </div>

              {/* Thumbnails */}
              {product.images?.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition ${
                        selectedImage === index ? 'border-blue-600 shadow' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={getProductImage(product, index)}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-around text-xs text-gray-500">
              <span className="flex items-center"><i className="fas fa-check-circle text-green-500 mr-1.5"></i> 100% Genuine</span>
              <span className="flex items-center"><i className="fas fa-truck text-blue-500 mr-1.5"></i> Direct Dispatch</span>
              <span className="flex items-center"><i className="fas fa-lock text-yellow-500 mr-1.5"></i> Buyer Safe</span>
            </div>
          </div>

          {/* Center: Product Information (4 cols) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              {product.category && (
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md mb-2 inline-block">
                  {product.category.name}
                </span>
              )}

              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug mt-1 mb-4">
                {product.name}
              </h1>

              {/* Pricing Box - IndiaMART style */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">
                  Wholesale / Approx Price
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-gray-900">
                    ₹{product.pricing?.price?.toLocaleString() || 'Contact'}
                  </span>
                  <span className="text-sm font-semibold text-gray-600">/ {unit}</span>
                </div>
                {product.pricing?.oldPrice && (
                  <div className="text-xs text-gray-400 mt-1">
                    MRP: <span className="line-through">₹{product.pricing.oldPrice.toLocaleString()}</span>
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-gray-600">Min. Order Qty (MOQ):</span>
                  <span className="font-bold text-gray-900">{moq}</span>
                </div>
              </div>

              {/* Key Highlights Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden mb-6 text-xs">
                <div className="bg-gray-100 px-4 py-2 font-bold text-gray-700">Quick Specs</div>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-2 text-gray-500 bg-gray-50 w-1/3">Packaging</td>
                      <td className="px-4 py-2 font-medium text-gray-800">Export Standard Carton / Sack</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-2 text-gray-500 bg-gray-50">Supply Ability</td>
                      <td className="px-4 py-2 font-medium text-gray-800">10,000+ Units per Month</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-2 text-gray-500 bg-gray-50">Delivery Time</td>
                      <td className="px-4 py-2 font-medium text-gray-800">3 - 7 Working Days Pan-India</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-gray-500 bg-gray-50">Payment Terms</td>
                      <td className="px-4 py-2 font-medium text-gray-800">T/T, NEFT, Advance / COD</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setIsEnquiryOpen(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center space-x-2 text-base"
              >
                <i className="fas fa-paper-plane"></i>
                <span>Get Best Price / Send Enquiry</span>
              </button>
              <p className="text-center text-[11px] text-gray-500">
                <i className="fas fa-bolt text-yellow-500 mr-1"></i> Receive instant wholesale response from verified manufacturer
              </p>
            </div>
          </div>

          {/* Right: Supplier / Seller Card (IndiaMART Profile style) (3 cols) */}
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl border-2 border-blue-500 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-1.5 mb-2">
                <span className="bg-green-100 text-green-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase flex items-center">
                  <i className="fas fa-shield-alt mr-1 text-green-600"></i> Verified Supplier
                </span>
                {seller.trustSeal && (
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    TrustSeal
                  </span>
                )}
              </div>

              <h3 className="text-lg font-extrabold text-gray-900 leading-tight mb-1">
                {sellerName}
              </h3>

              <div className="flex items-center space-x-2 mb-4">
                <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded flex items-center">
                  <i className="fas fa-star text-amber-500 mr-1 text-[10px]"></i>
                  {seller.rating || '4.8'}
                </span>
                <span className="text-xs text-gray-500">
                  ({seller.totalRatings || 45} Ratings)
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-gray-600 border-t border-gray-100 pt-4 mb-6">
                <div className="flex items-start">
                  <i className="fas fa-map-marker-alt text-gray-400 w-4 mt-0.5 flex-shrink-0"></i>
                  <span>{seller.address || `${seller.city || 'Jaipur'}, ${seller.state || 'Rajasthan'}`}</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-user-tie text-gray-400 w-4 flex-shrink-0"></i>
                  <span>Contact: <strong>{seller.contactPerson || 'Sales Department'}</strong></span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-briefcase text-gray-400 w-4 flex-shrink-0"></i>
                  <span>Type: <strong>{seller.businessType || 'Manufacturer & Wholesaler'}</strong></span>
                </div>
                {seller.yearEstablished && (
                  <div className="flex items-center">
                    <i className="fas fa-calendar-alt text-gray-400 w-4 flex-shrink-0"></i>
                    <span>Year Established: <strong>{seller.yearEstablished}</strong></span>
                  </div>
                )}
                {seller.gstin && (
                  <div className="flex items-center">
                    <i className="fas fa-file-invoice text-gray-400 w-4 flex-shrink-0"></i>
                    <span>GSTIN: <strong className="text-gray-800 font-mono">{seller.gstin}</strong></span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2.5 border-t border-gray-100 pt-4">
              <button
                onClick={() => setIsEnquiryOpen(true)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-lg text-xs shadow transition flex items-center justify-center space-x-1.5"
              >
                <i className="fas fa-envelope"></i>
                <span>Contact Supplier</span>
              </button>
              {seller._id && (
                <Link
                  to={`/seller/${seller.slug || seller._id}`}
                  className="w-full block text-center border border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 font-bold py-2 px-4 rounded-lg text-xs transition"
                >
                  View All Products from this Seller
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Product Description */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-12 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-3 mb-4">
            Product Description & Commercial Terms
          </h3>
          <div className="prose max-w-none text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {product.description || (
              <p>
                This product is offered by {sellerName} for commercial and bulk procurement. High standard manufacturing and strict quality checks are followed prior to dispatch. Contact supplier for custom packaging, OEM requirements, and volume-based pricing discounts.
              </p>
            )}
          </div>
        </div>

        {/* Related Products from same category */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Similar Products from this Industry
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProd) => (
                <Link
                  key={relProd._id}
                  to={`/product/${relProd.slug}`}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition flex flex-col justify-between group"
                >
                  <div className="h-44 rounded-lg overflow-hidden bg-gray-50 mb-3">
                    <img
                      src={getProductImage(relProd, 0)}
                      alt={relProd.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                      onError={(e) => { e.target.onerror = null; e.target.src = '/default-product.png'; }}
                    />
                  </div>
                  <h4 className="text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-blue-600">
                    {relProd.name}
                  </h4>
                  <div className="mt-2 text-sm font-bold text-gray-900">
                    ₹{relProd.pricing?.price?.toLocaleString() || 'Contact for Price'}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Global Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        product={product}
        seller={seller}
      />
    </div>
  );
};

export default ProductDetails;
