'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { productAPI, adminCategoryAPI } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import EnquiryModal from '@/components/EnquiryModal';

const toPage = (value) => {
    const n = parseInt(value, 10);
    return n > 0 ? n : 1;
};

// initial* props come from the server for the URL being opened (same API data),
// so the first HTML already contains the products of that page.
const ProductsPage = ({ initialFilters, initialData, initialCategories }) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryString = searchParams.toString();

    // State Management
    const [products, setProducts] = useState(initialData?.products || []);
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState('');
    const [totalProducts, setTotalProducts] = useState(initialData?.totalProducts || 0);
    const [totalPages, setTotalPages] = useState(initialData?.totalPages || 1);

    // Filter States
    const [selectedCategory, setSelectedCategory] = useState(initialFilters?.category || '');
    const [selectedSeller, setSelectedSeller] = useState(initialFilters?.seller || '');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [searchTerm, setSearchTerm] = useState(initialFilters?.search || '');
    const [currentPage, setCurrentPage] = useState(initialFilters?.page || 1);
    const itemsPerPage = 12;

    // Categories from API
    const [categories, setCategories] = useState(initialCategories || []);

    // Modal state
    const [enquiryProduct, setEnquiryProduct] = useState(null);
    const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

    // Fetch Categories
    useEffect(() => {
        if (initialCategories) return; // already rendered by the server
        const fetchFilters = async () => {
            try {
                const catRes = await adminCategoryAPI.getAll({ isActive: true });
                if (catRes.data.success) {
                    setCategories(catRes.data.categories || []);
                }
            } catch (e) {
                console.error('fetchFilters error:', e);
            }
        };
        fetchFilters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Parse the URL: category from the path (/shop/<category-slug>), the rest from the query.
    useEffect(() => {
        const params = new URLSearchParams(queryString);
        const categoryParam = params.get('category');
        const sellerParam = params.get('seller');
        const searchParam = params.get('search');
        const pageParam = params.get('page');

        const pathMatch = pathname.match(/^\/shop\/([^/]+)\/?$/);
        if (pathMatch) {
            const slug = decodeURIComponent(pathMatch[1]);
            const cat = categories.find((c) => c.slug === slug);
            if (cat) setSelectedCategory(cat._id);
        } else if (pathname === '/shop') {
            // Plain /shop = all categories (e.g. after pressing Back from a category).
            setSelectedCategory(categoryParam || '');
        }
        if (sellerParam) setSelectedSeller(sellerParam);
        if (searchParam) setSearchTerm(searchParam);
        // Follows the URL, so the browser Back button returns to the previous page of results.
        setCurrentPage(toPage(pageParam));
    }, [queryString, pathname, categories]);

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

    // Fetch whenever the filters change. The server already loaded the products for the
    // filters the page opened with, so that first request is skipped.
    const fetchKey = JSON.stringify([currentPage, selectedCategory, selectedSeller, searchTerm, sortBy, sortOrder]);
    const lastFetchKey = useRef(initialData ? fetchKey : null);

    useEffect(() => {
        if (lastFetchKey.current === fetchKey) return;
        lastFetchKey.current = fetchKey;
        fetchProducts();
    }, [fetchProducts, fetchKey]);

    // Crawlable URL for the current filters, e.g. /shop/clothing?page=3
    const buildHref = (overrides = {}) => {
        const values = {
            category: selectedCategory,
            seller: selectedSeller,
            search: searchTerm.trim() ? searchTerm : '',
            page: currentPage,
            ...overrides,
        };
        const qs = new URLSearchParams();
        const slug = values.category ? categories.find((c) => c._id === values.category)?.slug : '';
        const base = slug ? `/shop/${slug}` : '/shop';
        if (values.category && !slug) qs.set('category', values.category); // category list not loaded
        if (values.seller) qs.set('seller', values.seller);
        if (values.search) qs.set('search', values.search);
        if (values.page > 1) qs.set('page', String(values.page));
        const s = qs.toString();
        return s ? `${base}?${s}` : base;
    };

    // Same in-place page change as before (no reload), but the address bar now shows ?page=N.
    // Ctrl/Cmd/middle-click still open the page in a new tab like any normal link.
    const goToPage = (e, page) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        setCurrentPage(page);
        if (page !== currentPage) window.history.pushState(null, '', buildHref({ page }));
    };

    const handleCategoryChange = (catId) => {
        const next = catId === selectedCategory ? '' : catId;
        setSelectedCategory(next);
        setCurrentPage(1);
        // Same in-place filter as before; the address bar now shows /shop/<category-slug>.
        const href = buildHref({ category: next, page: 1 });
        if (href !== window.location.pathname + window.location.search) window.history.pushState(null, '', href);
    };

    const clearAllFilters = () => {
        setSelectedCategory('');
        setSelectedSeller('');
        setSearchTerm('');
        setCurrentPage(1);
        router.push('/shop');
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
                            <div>
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
                                {/* Real <a href> links so Google can follow every page; disabled state unchanged. */}
                                {currentPage <= 1 ? (
                                    <button
                                        disabled
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-gray-100 transition"
                                    >
                                        <i className="fas fa-chevron-left mr-1"></i> Prev
                                    </button>
                                ) : (
                                    <a
                                        href={buildHref({ page: currentPage - 1 })}
                                        rel="prev"
                                        onClick={(e) => goToPage(e, currentPage - 1)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-gray-100 transition"
                                    >
                                        <i className="fas fa-chevron-left mr-1"></i> Prev
                                    </a>
                                )}

                                <span className="text-xs font-semibold px-4 text-gray-700">
                                    {currentPage} / {totalPages}
                                </span>

                                {currentPage >= totalPages ? (
                                    <button
                                        disabled
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-gray-100 transition"
                                    >
                                        Next <i className="fas fa-chevron-right ml-1"></i>
                                    </button>
                                ) : (
                                    <a
                                        href={buildHref({ page: currentPage + 1 })}
                                        rel="next"
                                        onClick={(e) => goToPage(e, currentPage + 1)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-gray-100 transition"
                                    >
                                        Next <i className="fas fa-chevron-right ml-1"></i>
                                    </a>
                                )}
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
