'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { productAPI, adminCategoryAPI, sellerAPI } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import EnquiryModal from '@/components/EnquiryModal';
import { BASE_URL } from '@/lib/config';
import { categoryPath, sellerPath } from '@/lib/routes';
import { cleanPhone, isValidPhone, phoneInputProps } from '@/lib/validation';

const IMAGE_URL = BASE_URL;

// initial* props come from the server (same API data), so the first HTML already
// contains every card and link. If one is missing, that section loads in the browser as before.
const HomeContent = ({ initialCategories, initialProducts, initialSellers }) => {
    const router = useRouter();
    const [categories, setCategories] = useState(initialCategories || []);
    const [loadingCategories, setLoadingCategories] = useState(!initialCategories);
    const [featuredProducts, setFeaturedProducts] = useState(initialProducts || []);
    const [loadingProducts, setLoadingProducts] = useState(!initialProducts);
    const [topSellers, setTopSellers] = useState(initialSellers || []);
    const [loadingSellers, setLoadingSellers] = useState(!initialSellers);

    // Quick requirement hero state
    const [heroRequirement, setHeroRequirement] = useState('');
    const [heroPhone, setHeroPhone] = useState('');
    const [heroErrors, setHeroErrors] = useState({ requirement: '', phone: '' });

    // Modal state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant'
        });
        
        if (!initialCategories) fetchCategories();
        if (!initialProducts) fetchFeaturedProducts();
        if (!initialSellers) fetchTopSellers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            }
        } catch (err) {
            console.error('Fetch categories error:', err);
        } finally {
            setLoadingCategories(false);
        }
    };

    // Fetch featured products
    const fetchFeaturedProducts = async () => {
        try {
            setLoadingProducts(true);
            const response = await productAPI.getAll({ 
                limit: 8, 
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

    // Fetch top sellers
    const fetchTopSellers = async () => {
        try {
            setLoadingSellers(true);
            const response = await sellerAPI.getAll({ limit: 6 });
            if (response.data.success) {
                setTopSellers(response.data.sellers || []);
            }
        } catch (err) {
            console.error('Fetch sellers error:', err);
        } finally {
            setLoadingSellers(false);
        }
    };

    const handleOpenProductEnquiry = (product) => {
        setSelectedProduct(product);
        setSelectedSeller(product.seller || null);
        setIsEnquiryOpen(true);
    };

    const handleOpenSellerEnquiry = (seller) => {
        setSelectedProduct(null);
        setSelectedSeller(seller);
        setIsEnquiryOpen(true);
    };

    // Product name: letters and spaces only, max 50 characters.
    const handleHeroRequirementChange = (e) => {
        const clean = e.target.value.replace(/[^A-Za-z ]/g, '').replace(/ {2,}/g, ' ').slice(0, 50);
        setHeroRequirement(clean);
        if (heroErrors.requirement) setHeroErrors((prev) => ({ ...prev, requirement: '' }));
    };

    // Mobile number: digits only, exactly 10. A pasted "+91 98765 43210" keeps the last 10 digits.
    const handleHeroPhoneChange = (e) => {
        setHeroPhone(cleanPhone(e.target.value));
        if (heroErrors.phone) setHeroErrors((prev) => ({ ...prev, phone: '' }));
    };

    const handleHeroSubmit = (e) => {
        e.preventDefault();
        const errors = {
            requirement: heroRequirement.trim() ? '' : 'Please enter a product or service name.',
            phone: isValidPhone(heroPhone) ? '' : 'Please enter a valid 10-digit mobile number.',
        };
        setHeroErrors(errors);
        if (errors.requirement || errors.phone) return;
        setSelectedProduct(null);
        setSelectedSeller(null);
        setIsEnquiryOpen(true);
    };

    const getCategoryImage = (category) => {
        if (category.image) {
            return `${IMAGE_URL}/uploads/categories/${category.image}`;
        }
        return null;
    };

    return (
        <main className="bg-gray-50 min-h-screen">
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 text-white py-12 px-4 shadow-inner">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        {/* Hero Text */}
                        <div className="lg:col-span-7">
                            <span className="inline-block bg-yellow-400 text-blue-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-4 shadow">
                                Direct Manufacturer Deals
                            </span>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight mb-4">
                                Connect with Verified Indian Manufacturers & Suppliers
                            </h1>
                            <p className="text-blue-100 text-base sm:text-lg mb-6 leading-relaxed">
                                Get instant quotes, bulk discounts, and verified supplier contacts across clothing, home decor, beauty, groceries, and industrial supplies.
                            </p>
                            <div className="flex flex-wrap gap-4 text-xs font-semibold text-blue-200">
                                <div className="flex items-center">
                                    <i className="fas fa-check-circle text-green-400 mr-2 text-base"></i> 100% Verified GST Suppliers
                                </div>
                                <div className="flex items-center">
                                    <i className="fas fa-bolt text-yellow-400 mr-2 text-base"></i> Fast Buyer Quotes
                                </div>
                                <div className="flex items-center">
                                    <i className="fas fa-handshake text-blue-300 mr-2 text-base"></i> Zero Commission
                                </div>
                            </div>
                        </div>

                        {/* Quick Post Requirement Box (IndiaMART style) */}
                        <div className="lg:col-span-5 bg-white text-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-100">
                            <div className="border-b pb-3 mb-4">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                    <i className="fas fa-paper-plane text-blue-600 mr-2"></i>
                                    Post Your Buying Requirement
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Tell us what you need & get competitive quotes
                                </p>
                            </div>

                            <form onSubmit={handleHeroSubmit} noValidate className="space-y-3.5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        Product / Service Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Cotton Shirts, Digital Clocks, Spices..."
                                        value={heroRequirement}
                                        onChange={handleHeroRequirementChange}
                                        maxLength={50}
                                        aria-invalid={!!heroErrors.requirement}
                                        className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${heroErrors.requirement ? 'border-red-500' : 'border-gray-300'}`}
                                        required
                                    />
                                    {heroErrors.requirement && (
                                        <p className="text-xs text-red-600 mt-1">{heroErrors.requirement}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        Your Mobile Number
                                    </label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 text-sm text-gray-600 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg font-semibold">
                                            +91
                                        </span>
                                        <input
                                            type="tel"
                                            placeholder="Enter 10-digit mobile number"
                                            value={heroPhone}
                                            onChange={handleHeroPhoneChange}
                                            {...phoneInputProps}
                                            aria-invalid={!!heroErrors.phone}
                                            className={`w-full px-3.5 py-2.5 border rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${heroErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                            required
                                        />
                                    </div>
                                    {heroErrors.phone && (
                                        <p className="text-xs text-red-600 mt-1">{heroErrors.phone}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 text-sm"
                                >
                                    <span>Get Best Price & Quotes</span>
                                    <i className="fas fa-arrow-right text-xs"></i>
                                </button>
                                <p className="text-center text-[11px] text-gray-500">
                                    <i className="fas fa-shield-alt text-green-600 mr-1"></i> Verified suppliers contact you directly.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-10 max-w-6xl">
                {/* Dynamic Categories Section */}
                <section id="categories" className="pt-8 md:pt-10 mb-14">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                                Explore Industry Categories
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Find specialized manufacturers and wholesalers by industry sector
                            </p>
                        </div>
                        <Link href="/shop" className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center">
                            <span>View All Products</span>
                            <i className="fas fa-chevron-right text-xs ml-1.5"></i>
                        </Link>
                    </div>
                    
                    {loadingCategories ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {[...Array(5)].map((_, index) => (
                                <div key={index} className="h-36 bg-gray-200 animate-pulse rounded-xl"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {categories.map((category) => (
                                <Link
                                    key={category._id}
                                    href={categoryPath(category)}
                                    className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200 flex flex-col items-center text-center group"
                                >
                                    <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-3 overflow-hidden border border-blue-100 group-hover:scale-105 transition-transform">
                                        {getCategoryImage(category) ? (
                                            <img
                                                src={getCategoryImage(category)}
                                                alt={category.name}
                                                loading="lazy"
                                                decoding="async"
                                                className="w-full h-full object-cover"
                                                onError={(e) => { 
                                                    e.target.onerror = null; 
                                                    e.target.src = '/default-category.png'; 
                                                }}
                                            />
                                        ) : (
                                            <i className="fas fa-tags text-2xl text-blue-500"></i>
                                        )}
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                                        {category.name}
                                    </h4>
                                    <span className="text-[11px] text-gray-500 mt-1 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {category.productCount || 0}+ Products
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* Featured Products Showcase (IndiaMART Product Cards with Seller Name & Enquiry Button) */}
                <section className="mb-14">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                                Wholesale Supplier Deals
                            </span>
                            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                                Trending Products & Wholesale Deals
                            </h2>
                        </div>
                        <Link href="/shop" className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center">
                            <span>Browse Catalog</span>
                            <i className="fas fa-arrow-right text-xs ml-1.5"></i>
                        </Link>
                    </div>

                    {loadingProducts ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="h-80 bg-gray-200 animate-pulse rounded-xl"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredProducts.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    onEnquiry={handleOpenProductEnquiry}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* Verified Sellers / Suppliers Section (IndiaMART Supplier Spotlight) */}
                <section className="mb-14">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-green-600">
                                Verified Manufacturers & Exporters
                            </span>
                            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                                Top Verified Suppliers by Main Category
                            </h2>
                        </div>
                        <Link href="/sellers" className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center">
                            <span>All Suppliers Directory</span>
                            <i className="fas fa-chevron-right text-xs ml-1.5"></i>
                        </Link>
                    </div>

                    {loadingSellers ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[...Array(3)].map((_, index) => (
                                <div key={index} className="h-56 bg-gray-200 animate-pulse rounded-xl"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {topSellers.map((seller) => (
                                <div
                                    key={seller._id}
                                    className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                                    <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded uppercase tracking-wider">
                                                        {seller.mainCategory?.name || 'Supplier'}
                                                    </span>
                                                    {seller.isVerified && (
                                                        <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded flex items-center">
                                                            <i className="fas fa-check-circle text-green-600 mr-1"></i> Verified
                                                        </span>
                                                    )}
                                                </div>
                                                <Link href={sellerPath(seller)}>
                                                    <h3 className="text-base font-bold text-gray-900 hover:text-blue-600 transition-colors">
                                                        {seller.name}
                                                    </h3>
                                                </Link>
                                            </div>
                                            {seller.rating && (
                                                <span className="flex-shrink-0 ml-2 bg-amber-50 text-amber-800 font-extrabold text-xs px-2 py-1 rounded-md border border-amber-200 flex items-center">
                                                    <i className="fas fa-star text-amber-500 mr-1 text-[10px]"></i>
                                                    {seller.rating}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                                            {seller.description || 'Verified manufacturer offering bulk wholesale catalog with assured delivery.'}
                                        </p>

                                        <div className="space-y-1 text-xs text-gray-500 border-t border-gray-100 pt-3">
                                            <div className="flex items-center">
                                                <i className="fas fa-map-marker-alt text-gray-400 w-4"></i>
                                                <span>{seller.city}, {seller.state}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <i className="fas fa-briefcase text-gray-400 w-4"></i>
                                                <span>{seller.businessType} (Est. {seller.yearEstablished})</span>
                                            </div>
                                            <div className="flex items-center">
                                                <i className="fas fa-boxes text-gray-400 w-4"></i>
                                                <span className="font-semibold text-gray-700">{seller.productCount || 0} Products in Catalog</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center space-x-2">
                                        <button
                                            onClick={() => handleOpenSellerEnquiry(seller)}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg text-xs transition flex items-center justify-center space-x-1.5"
                                        >
                                            <i className="fas fa-envelope"></i>
                                            <span>Enquiry</span>
                                        </button>
                                        <Link
                                            href={sellerPath(seller)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                                        >
                                            Catalog
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Value Proposition */}
                <section className="bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-100 p-8 shadow-sm">
                    <div className="text-center max-w-2xl mx-auto mb-8">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                            India's Trusted Trade Platform
                        </span>
                        <h2 className="text-2xl font-extrabold text-gray-900 mt-1">
                            Why Source on Finoxis?
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Everything you need to source directly from verified Indian factories & distributors
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm text-center">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 text-xl">
                                <i className="fas fa-industry"></i>
                            </div>
                            <h4 className="font-bold text-gray-900 text-sm mb-1">Direct Factory Prices</h4>
                            <p className="text-xs text-gray-500">Cut middlemen. Negotiate bulk wholesale rates directly with manufacturers.</p>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm text-center">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-3 text-xl">
                                <i className="fas fa-shield-alt"></i>
                            </div>
                            <h4 className="font-bold text-gray-900 text-sm mb-1">GST Verified Suppliers</h4>
                            <p className="text-xs text-gray-500">All registered suppliers have verified credentials, GSTIN, and business addresses.</p>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm text-center">
                            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-3 text-xl">
                                <i className="fas fa-comments"></i>
                            </div>
                            <h4 className="font-bold text-gray-900 text-sm mb-1">Instant Quotes</h4>
                            <p className="text-xs text-gray-500">Submit an enquiry and receive multiple competitive quotes on Call & WhatsApp.</p>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm text-center">
                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 text-xl">
                                <i className="fas fa-truck-moving"></i>
                            </div>
                            <h4 className="font-bold text-gray-900 text-sm mb-1">Pan-India Reach</h4>
                            <p className="text-xs text-gray-500">Suppliers ready to dispatch bulk lots across major industrial hubs in India.</p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Global Enquiry Modal */}
            <EnquiryModal
                isOpen={isEnquiryOpen}
                onClose={() => setIsEnquiryOpen(false)}
                product={selectedProduct}
                seller={selectedSeller}
                // Only what the visitor typed in the homepage form — no extra text added.
                initialMessage={heroRequirement}
                initialPhone={heroPhone}
            />
        </main>
    );
};

export default HomeContent;
