import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { productAPI, adminCategoryAPI, sellerAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import EnquiryModal from '../components/EnquiryModal';

const ProductsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State Management
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Filter States
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSeller, setSelectedSeller] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Categories & Sellers from API
    const [categories, setCategories] = useState([]);
    const [sellers, setSellers] = useState([]);

    // Modal state
    const [enquiryProduct, setEnquiryProduct] = useState(null);
    const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

    // Fetch Categories & Sellers
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [catRes, sellerRes] = await Promise.all([
                    adminCategoryAPI.getAll({ isActive: true }),
                    sellerAPI.getAll({ limit: 50 }),
                ]);
                if (catRes.data.success) {
                    setCategories(catRes.data.categories || []);
                }
                if (sellerRes.data.success) {
                    setSellers(sellerRes.data.sellers || []);
                }
            } catch (e) {
                console.error('fetchFilters error:', e);
            }
        };
        fetchFilters();
    }, []);

    // Parse URL params on mount
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const categoryParam = params.get('category');
        const sellerParam = params.get('seller');
        const searchParam = params.get('search');
        const pageParam = params.get('page');

        if (categoryParam) setSelectedCategory(categoryParam);
        if (sellerParam) setSelectedSeller(sellerParam);
        if (searchParam) setSearchTerm(searchParam);
        if (pageParam) setCurrentPage(parseInt(pageParam));
    }, [location.search]);

    // Fetch Products with filters
    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const params = {
                page: currentPage,
                limit: itemsPerPage,
                sort: sortBy,
                order: sortOrder,
            };

            if (selectedCategory) params.category = selectedCategory;
            if (selectedSeller) params.seller = selectedSeller;
            if (searchTerm.trim()) params.search = searchTerm.trim();

            const response = await productAPI.getAll(params);

            if (response.data.success) {
                setProducts(response.data.products || []);
                setTotalProducts(response.data.totalProducts || 0);
                setTotalPages(response.data.totalPages || 1);
            } else {
                setError('Failed to load products');
            }
        } catch (err) {
            console.error('fetchProducts error:', err);
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    }, [currentPage, selectedCategory, selectedSeller, searchTerm, sortBy, sortOrder]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleCategoryChange = (catId) => {
        setSelectedCategory(catId === selectedCategory ? '' : catId);
        setCurrentPage(1);
    };

    const handleSellerChange = (sellerId) => {
        setSelectedSeller(sellerId === selectedSeller ? '' : sellerId);
        setCurrentPage(1);
    };

    const clearAllFilters = () => {
        setSelectedCategory('');
        setSelectedSeller('');
        setSearchTerm('');
        setCurrentPage(1);
        navigate('/shop');
    };

    const handleOpenEnquiry = (product) => {
        setEnquiryProduct(product);
        setIsEnquiryOpen(true);
    };

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                
                {/* Header Banner */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                Wholesale Catalog & Supplier Directory
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
                                Products & Wholesale Directory
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Showing direct prices from verified manufacturers, wholesalers & exporters in India
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className="bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-200">
                                {totalProducts} Products Available
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar Filters */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                            <div className="flex items-center justify-between pb-3 border-b mb-4">
                                <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider flex items-center">
                                    <i className="fas fa-filter text-blue-600 mr-2"></i> Filters
                                </h3>
                                {(selectedCategory || selectedSeller || searchTerm) && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-xs text-red-600 hover:underline font-bold"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {/* Search Filter */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                                    Search Product
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Keywords..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <i className="fas fa-search absolute left-3 top-2.5 text-gray-400 text-xs"></i>
                                </div>
                            </div>

                            {/* Category Filter */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                                    Industry Categories
                                </label>
                                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                                    <button
                                        onClick={() => handleCategoryChange('')}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                                            !selectedCategory
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <span>All Categories</span>
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat._id}
                                            onClick={() => handleCategoryChange(cat._id)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                                                selectedCategory === cat._id
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <span className="truncate">{cat.name}</span>
                                            {cat.productCount > 0 && (
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                                    selectedCategory === cat._id ? 'bg-blue-800 text-white' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {cat.productCount}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Seller / Supplier Filter */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                                    Verified Suppliers
                                </label>
                                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                                    <button
                                        onClick={() => handleSellerChange('')}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                                            !selectedSeller
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <span>All Suppliers</span>
                                    </button>
                                    {sellers.map((s) => (
                                        <button
                                            key={s._id}
                                            onClick={() => handleSellerChange(s._id)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                                                selectedSeller === s._id
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <span className="truncate" title={s.name}>{s.name}</span>
                                            <span className="text-[10px] text-gray-400">({s.city})</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Procurement Support Banner */}
                        <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white p-5 rounded-2xl shadow-sm">
                            <h4 className="font-extrabold text-sm mb-1">Need Custom Quotations?</h4>
                            <p className="text-xs text-blue-100 mb-3 leading-relaxed">
                                Let our procurement team connect you directly with certified suppliers.
                            </p>
                            <button
                                onClick={() => {
                                    setEnquiryProduct(null);
                                    setIsEnquiryOpen(true);
                                }}
                                className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-bold text-xs py-2.5 px-3 rounded-lg shadow transition"
                            >
                                <i className="fas fa-edit mr-1"></i> Post Your Requirement
                            </button>
                        </div>
                    </div>

                    {/* Right Products Grid */}
                    <div className="lg:col-span-3">
                        {/* Top Toolbar */}
                        <div className="bg-white rounded-xl border border-gray-200 p-3 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                            <div className="text-xs text-gray-600">
                                Page <strong className="text-gray-900">{currentPage}</strong> of <strong className="text-gray-900">{totalPages}</strong> ({totalProducts} items found)
                            </div>
                            <div className="flex items-center space-x-2 text-xs">
                                <span className="font-semibold text-gray-600">Sort By:</span>
                                <select
                                    value={`${sortBy}-${sortOrder}`}
                                    onChange={(e) => {
                                        const [newSort, newOrder] = e.target.value.split('-');
                                        setSortBy(newSort);
                                        setSortOrder(newOrder);
                                    }}
                                    className="border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-gray-700"
                                >
                                    <option value="createdAt-desc">Newest Products</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                    <option value="name-asc">Product Name (A-Z)</option>
                                </select>
                            </div>
                        </div>

                        {/* Product Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-2xl"></div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8">
                                <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-3"></i>
                                <h3 className="text-base font-bold text-gray-800">{error}</h3>
                                <button
                                    onClick={fetchProducts}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8">
                                <i className="fas fa-boxes text-5xl text-gray-300 mb-4"></i>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">No Products Match Your Filter</h3>
                                <p className="text-xs text-gray-500 mb-6">
                                    Try selecting another category or clear your search term.
                                </p>
                                <button
                                    onClick={clearAllFilters}
                                    className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                        onEnquiry={handleOpenEnquiry}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-2 mt-10">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-gray-100 transition"
                                >
                                    <i className="fas fa-chevron-left mr-1"></i> Prev
                                </button>

                                <span className="text-xs font-semibold px-4 text-gray-700">
                                    {currentPage} / {totalPages}
                                </span>

                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-gray-100 transition"
                                >
                                    Next <i className="fas fa-chevron-right ml-1"></i>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Global Enquiry Modal */}
            <EnquiryModal
                isOpen={isEnquiryOpen}
                onClose={() => setIsEnquiryOpen(false)}
                product={enquiryProduct}
                seller={enquiryProduct?.seller || null}
            />
        </div>
    );
};

export default ProductsPage;
