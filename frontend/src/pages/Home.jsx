import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productAPI, adminCategoryAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import '../assets/css/templatemo.css';
import '../assets/css/tailwind.min.css';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const IMAGE_URL = BASE_URL.replace('/api', '');

const HomeContent = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart(); // Get addToCart from context
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [error, setError] = useState('');
    const [addingToCart, setAddingToCart] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant'
        });
        
        fetchCategories();
        fetchFeaturedProducts();
    }, []);

    // Show toast message
    const showToast = (message, type = 'success', duration = 3000) => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: 'success' });
        }, duration);
    };

    // Fetch categories
    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const response = await adminCategoryAPI.getAll({ 
                isActive: true, 
                limit: 12 
            });
            if (response.data.success) {
                setCategories(response.data.categories || []);
            } else {
                setError('Failed to load categories');
            }
        } catch (err) {
            console.error('Fetch categories error:', err);
            setError('Failed to load categories');
        } finally {
            setLoadingCategories(false);
        }
    };

    // Fetch featured products
    const fetchFeaturedProducts = async () => {
        try {
            setLoadingProducts(true);
            const response = await productAPI.getAll({ 
                limit: 4, 
                sort: '-createdAt',
                isActive: true 
            });
            if (response.data.success) {
                setFeaturedProducts(response.data.products || []);
            }
        } catch (err) {
            console.error('Fetch products error:', err);
        } finally {
            setLoadingProducts(false);
        }
    };

    // Enhanced add to cart function with animation and toast
    const handleAddToCart = async (product) => {
        // Check stock
        if (!product.stock?.inStock) {
            showToast('This product is out of stock', 'error');
            return;
        }

        setAddingToCart(product._id);

        // Add animation class
        const button = document.getElementById(`add-to-cart-btn-${product._id}`);
        if (button) {
            button.classList.add('animate-bounce');
        }

        // Use the cart context addToCart
        const result = await addToCart(product._id, 1);

        if (result.success) {
            showToast(`${product.name} added to cart successfully!`, 'success');
        } 
        // else {
        //     showToast(result.message || 'Failed to add to cart', 'error');
        // }

        // Remove animation
        setTimeout(() => {
            if (button) {
                button.classList.remove('animate-bounce');
            }
            setAddingToCart(null);
        }, 500);
    };

    // Buy now function
    const handleBuyNow = async (product) => {
        // Check if user is logged in
        const user = localStorage.getItem('user');
        if (!user) {
            showToast('Please login to continue', 'error');
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        // Check stock
        if (!product.stock?.inStock) {
            showToast('This product is out of stock', 'error');
            return;
        }

        // Add to cart first, then go to checkout
        const result = await addToCart(product._id, 1);
        
        if (result.success) {
            navigate('/checkout');
        } else {
            showToast(result.message || 'Failed to process', 'error');
        }
    };

    const handleCategoryClick = (categoryId, categoryName) => {
        navigate(`/products?category=${categoryId}`);
    };

    const getProductImage = (product) => {
        if (product.images?.length > 0) {
            const img = product.images[0];
            return img.url?.startsWith('http') ? img.url : `${IMAGE_URL}/uploads/products/${img.url}`;
        }
        return '/default-product.png';
    };

    const getCategoryImage = (category) => {
        if (category.image) {
            return `${IMAGE_URL}/uploads/categories/${category.image}`;
        }
        return null;
    };

    const getDiscount = (product) => {
        const { price, oldPrice } = product.pricing || {};
        if (price && oldPrice && oldPrice > price) {
            return Math.round(((oldPrice - price) / oldPrice) * 100);
        }
        return null;
    };

    return (
        <main className="container mx-auto px-4 py-6">
            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed top-20 right-4 z-50 animate-slide-in">
                    <div className={`flex items-center p-4 rounded-lg shadow-lg ${
                        toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    } text-white`}>
                        <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Banner Slider */}
            <div className="banner-slider mb-8">
                <img
                    src="/banner.jpg"
                    alt="Sale Banner"
                    className="w-full h-auto rounded-lg"
                    onError={(e) => { e.target.src = '/default-banner.jpg'; }}
                />
            </div>

            {/* Dynamic Categories Section */}
            <section id="categories" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Shop by Category</h2>
                
                {loadingCategories ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="category-card-skeleton">
                                <div className="skeleton-img"></div>
                                <div className="skeleton-text"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <p className="text-red-500">{error}</p>
                        <button 
                            onClick={fetchCategories}
                            className="mt-4 text-blue-600 hover:underline"
                        >
                            Try Again
                        </button>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No categories available</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {categories.map((category) => (
                            <div
                                key={category._id}
                                className="category-card cursor-pointer"
                            >
                                <div className="category-img">
                                    {getCategoryImage(category) ? (
                                        <img
                                            src={getCategoryImage(category)}
                                            alt={category.name}
                                            className="w-full h-full object-contain"
                                            onError={(e) => { e.target.src = '/default-category.png'; }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                                            <i className="fas fa-tag text-4xl text-gray-400"></i>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm font-medium text-gray-700">
                                    {category.name}
                                </p>
                                {category.productCount > 0 && (
                                    <p className="text-xs text-gray-500 text-center">
                                        {category.productCount} products
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Today's Deals - Dynamic Products */}
            <section id="deals" className="mb-12">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Today's Deals</h2>
                    <Link to="/shop" className="text-blue-600 font-medium hover:underline">View All</Link>
                </div>
                
                {loadingProducts ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[...Array(5)].map((_, index) => (
                            <div key={index} className="product-card-skeleton">
                                <div className="skeleton-img"></div>
                                <div className="skeleton-text"></div>
                                <div className="skeleton-price"></div>
                            </div>
                        ))}
                    </div>
                ) : featuredProducts.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No products available</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {featuredProducts.map((product) => {
                            const discount = getDiscount(product);
                            const imageUrl = getProductImage(product);
                            const isAdding = addingToCart === product._id;
                            
                            return (
                                <div key={product._id} className="deal-card group hover:shadow-lg transition-all duration-300">
                                    {/* Product Image */}
                                    <Link to={`/product/${product.slug}`} className="block relative overflow-hidden rounded-lg">
                                        <img 
                                            src={imageUrl} 
                                            alt={product.name} 
                                            className="product-img w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                                            onError={(e) => { e.target.src = '/default-product.png'; }}
                                        />
                                        {discount && (
                                            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                                                {discount}% OFF
                                            </span>
                                        )}
                                        {!product.stock?.inStock && (
                                            <span className="absolute top-2 left-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded z-10">
                                                Out of Stock
                                            </span>
                                        )}
                                        {product.stock?.inStock && product.stock?.quantity < 10 && (
                                            <span className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                                                Only {product.stock.quantity} left
                                            </span>
                                        )}
                                    </Link>

                                    {/* Product Info */}
                                    <div className="p-3">
                                        <Link to={`/product/${product.slug}`}>
                                            <h3 className="text-sm font-medium text-gray-800 mb-2 hover:text-blue-600 transition-colors line-clamp-2 min-h-[40px]">
                                                {product.name}
                                            </h3>
                                        </Link>

                                        {/* Category */}
                                        {product.category && (
                                            <div className="text-xs text-gray-500 mb-2">
                                                {typeof product.category === 'object' ? product.category.name : 'Uncategorized'}
                                            </div>
                                        )}

                                        {/* Price Section */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <span className="text-lg font-bold text-gray-900">
                                                    ₹{product.pricing?.price?.toLocaleString()}
                                                </span>
                                                {product.pricing?.oldPrice && (
                                                    <span className="text-sm text-gray-400 line-through ml-2">
                                                        ₹{product.pricing.oldPrice.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                            {discount && (
                                                <span className="text-xs text-green-600 font-medium">
                                                    Save {discount}%
                                                </span>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <button
                                                id={`add-to-cart-btn-${product._id}`}
                                                onClick={() => handleAddToCart(product)}
                                                disabled={!product.stock?.inStock || isAdding}
                                                className={`add-to-cart-btn ${
                                                    product.stock?.inStock && !isAdding
                                                        ? 'add-to-cart-btn'
                                                        : 'add-to-cart-btn cursor-not-allowed'
                                                }`}
                                            >
                                                {isAdding ? (
                                                    <i className="fas fa-spinner fa-spin mr-1"></i>
                                                ) : (
                                                    <i className="fas fa-shopping-cart mr-1"></i>
                                                )}
                                                {isAdding ? 'Adding...' : 'Add to Cart'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* About Section */}
            <section id="about" className="bg-white p-8 rounded-lg mb-12 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">About SHARNETIC TECHNOLOGIES</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <p className="text-gray-600 mb-4">
                            SHARNETIC TECHNOLOGIES PRIVATE LIMITED is a fast-growing eCommerce marketplace designed to make
                            online shopping simple, affordable, and accessible for everyone.
                        </p>
                        <p className="text-gray-600 mb-6">
                            From fashion to home essentials, electronics, and groceries, we deliver quality products
                            at unbeatable prices right to your doorstep.
                        </p>
                        <Link
                            to="/shop"
                            className="inline-block bg-blue-600 text-white px-6 py-3 rounded font-medium hover:bg-blue-700 transition"
                        >
                            Explore All Products
                        </Link>
                    </div>
                    <div>
                        <img 
                            src="/about.jpg" 
                            alt="About Us" 
                            className="w-full h-auto rounded-lg"
                            onError={(e) => { e.target.src = '/default-about.jpg'; }}
                        />
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Choose SHARNETIC TECHNOLOGIES?</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg text-center shadow-sm hover:shadow-md transition group">
                        <div className="text-blue-600 text-3xl mb-4 group-hover:scale-110 transition-transform">
                            <i className="fas fa-shipping-fast"></i>
                        </div>
                        <h3 className="font-bold text-lg mb-2">Free Shipping</h3>
                        <p className="text-gray-600">On orders above ₹499</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg text-center shadow-sm hover:shadow-md transition group">
                        <div className="text-blue-600 text-3xl mb-4 group-hover:scale-110 transition-transform">
                            <i className="fas fa-shield-alt"></i>
                        </div>
                        <h3 className="font-bold text-lg mb-2">Safe & Secure</h3>
                        <p className="text-gray-600">100% secure payments</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg text-center shadow-sm hover:shadow-md transition group">
                        <div className="text-blue-600 text-3xl mb-4 group-hover:scale-110 transition-transform">
                            <i className="fas fa-undo-alt"></i>
                        </div>
                        <h3 className="font-bold text-lg mb-2">Easy Returns</h3>
                        <p className="text-gray-600">10-day return policy</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg text-center shadow-sm hover:shadow-md transition group">
                        <div className="text-blue-600 text-3xl mb-4 group-hover:scale-110 transition-transform">
                            <i className="fas fa-headset"></i>
                        </div>
                        <h3 className="font-bold text-lg mb-2">24/7 Support</h3>
                        <p className="text-gray-600">Customer care always available</p>
                    </div>
                </div>
            </section>

            {/* Add CSS for animations */}
            <style jsx>{`
                @keyframes bounce {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(0.95); }
                }
                
                .animate-bounce {
                    animation: bounce 0.3s ease-in-out;
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                .animate-slide-in {
                    animation: slideIn 0.3s ease-out;
                }
                
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </main>
    );
};

export default HomeContent;