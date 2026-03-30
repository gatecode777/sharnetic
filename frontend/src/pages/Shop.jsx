import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { productAPI, adminCategoryAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';

// Helper Functions
const formatCurrency = (amount) => '₹' + parseInt(amount).toLocaleString('en-IN');

const calculateDiscount = (currentPrice, originalPrice) => {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

// Custom debounce function
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

const ProductsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { addToCart } = useCart(); // Get addToCart from context
    const { showToast } = useToast(); // For adding toast notifications

    // State Management
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Filter States
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Categories from API
    const [categories, setCategories] = useState([]);

    // Debounced search term
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await adminCategoryAPI.getAll({ isActive: true });
                if (response.data.success) {
                    setCategories(response.data.categories);
                }
            } catch (e) {
                console.error('fetchCategories error:', e);
            }
        };
        fetchCategories();
    }, []);

    // Parse URL params on mount
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const categoryParam = params.get('category');
        const searchParam = params.get('search');
        const pageParam = params.get('page');
        const minPriceParam = params.get('minPrice');
        const maxPriceParam = params.get('maxPrice');

        if (categoryParam) {
            setSelectedCategories([categoryParam]);
        }

        if (searchParam) {
            setSearchTerm(searchParam);
        }

        if (pageParam) {
            setCurrentPage(parseInt(pageParam));
        }

        if (minPriceParam) {
            setPriceRange(prev => ({ ...prev, min: parseInt(minPriceParam) }));
        }

        if (maxPriceParam) {
            setPriceRange(prev => ({ ...prev, max: parseInt(maxPriceParam) }));
        }
    }, [location.search]);

    // Reset page when debounced search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, selectedCategories, priceRange, sortBy, sortOrder]);

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

            // Add category filter - use category ID
            if (selectedCategories.length > 0) {
                // For multiple categories, we need to handle it on backend
                // For now, use the first category
                params.category = selectedCategories[0];
            }

            // Add search
            if (debouncedSearchTerm.trim()) {
                params.search = debouncedSearchTerm.trim();
            }

            // Add price range
            if (priceRange.min > 0) {
                params.minPrice = priceRange.min;
            }
            if (priceRange.max < 50000) {
                params.maxPrice = priceRange.max;
            }

            const response = await productAPI.getAll(params);

            if (response.data.success) {
                setProducts(response.data.products);
                setTotalProducts(response.data.totalProducts);
                setTotalPages(response.data.totalPages);
            } else {
                setError('Failed to load products');
            }
        } catch (err) {
            console.error('fetchProducts error:', err);
            setError(err.response?.data?.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [currentPage, sortBy, sortOrder, selectedCategories, debouncedSearchTerm, priceRange]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();

        if (selectedCategories.length === 1) {
            params.set('category', selectedCategories[0]);
        }

        if (searchTerm) {
            params.set('search', searchTerm);
        }

        if (currentPage > 1) {
            params.set('page', currentPage);
        }

        if (priceRange.min > 0) {
            params.set('minPrice', priceRange.min);
        }

        if (priceRange.max < 50000) {
            params.set('maxPrice', priceRange.max);
        }

        const newUrl = `${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
        navigate(newUrl, { replace: true });
    }, [selectedCategories, searchTerm, currentPage, priceRange, location.pathname, navigate]);

    // Handle category change
    const handleCategoryChange = (categoryId) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(c => c !== categoryId)
                : [...prev, categoryId]
        );
        setCurrentPage(1);
    };

    // Handle price change
    const handlePriceChange = (type, value) => {
        setPriceRange(prev => ({ ...prev, [type]: parseInt(value) || 0 }));
    };

    const applyPriceFilter = () => {
        setCurrentPage(1);
    };

    // Handle sort change
    const handleSortChange = (e) => {
        const value = e.target.value;
        switch (value) {
            case 'price-low':
                setSortBy('price');
                setSortOrder('asc');
                break;
            case 'price-high':
                setSortBy('price');
                setSortOrder('desc');
                break;
            case 'name-asc':
                setSortBy('name');
                setSortOrder('asc');
                break;
            case 'name-desc':
                setSortBy('name');
                setSortOrder('desc');
                break;
            case 'newest':
                setSortBy('createdAt');
                setSortOrder('desc');
                break;
            default:
                setSortBy('createdAt');
                setSortOrder('desc');
        }
        setCurrentPage(1);
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSelectedCategories([]);
        setPriceRange({ min: 0, max: 50000 });
        setSortBy('createdAt');
        setSortOrder('desc');
        setSearchTerm('');
        setCurrentPage(1);
    };

    // Add to cart functionality
    const handleAddToCart = async (product) => {
        // Check stock
        if (!product.stock?.inStock) {
            showToast('This product is out of stock', 'error', 3000);
            return;
        }

        // Use the cart context addToCart
        const result = await addToCart(product._id, 1);

        if (result.success) {
            // Optional: Add animation or visual feedback
            const button = document.getElementById(`add-to-cart-btn-${product._id}`);
            if (button) {
                button.classList.add('animate-bounce');
                setTimeout(() => {
                    button.classList.remove('animate-bounce');
                }, 500);
            }
        }
    };

    const handleBuyNow = (product) => {
        const user = sessionStorage.getItem('currentUser');
        if (!user) {
            navigate('/login');
            return;
        }

        if (!product.stock?.inStock) {
            showToast('This product is out of stock', 'error', 3000);
            return;
        }

        // Add to cart first, then go to checkout
        addToCart(product._id, 1).then(() => {
            navigate('/checkout');
        });
    };

    // Get category name by ID
    const getCategoryName = (categoryId) => {
        const category = categories.find(c => c._id === categoryId);
        return category ? category.name : 'Uncategorized';
    };

    return (
        <main className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <div className="mb-6">
                <nav className="breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <Link to="/" className="inline-flex items-center text-sm text-gray-700 hover:text-blue-600">
                                <i className="fas fa-home mr-2"></i> Home
                            </Link>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <i className="fas fa-chevron-right text-gray-400 mx-2 text-xs"></i>
                                <span className="text-sm font-medium text-gray-500">
                                    {selectedCategories.length === 1
                                        ? getCategoryName(selectedCategories[0])
                                        : (searchTerm ? `Search: "${searchTerm}"` : 'All Products')}
                                </span>
                            </div>
                        </li>
                    </ol>
                </nav>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Filter Sidebar */}
                <div className="lg:w-1/4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Filters</h2>

                        {/* Categories */}
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-700 mb-3">Categories</h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {categories.map(cat => (
                                    <div key={cat._id} className="flex items-center justify-between">
                                        <div className="flex items-center flex-1">
                                            <input
                                                type="checkbox"
                                                id={`cat-${cat._id}`}
                                                checked={selectedCategories.includes(cat._id)}
                                                onChange={() => handleCategoryChange(cat._id)}
                                                className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                            />
                                            <label htmlFor={`cat-${cat._id}`} className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                                                {cat.name}
                                            </label>
                                        </div>
                                        {cat.productCount !== undefined && (
                                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                                {cat.productCount}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-700 mb-3">Price Range</h4>
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 block mb-1">Min (₹)</label>
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={priceRange.min || ''}
                                            onChange={(e) => handlePriceChange('min', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 block mb-1">Max (₹)</label>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={priceRange.max || ''}
                                            onChange={(e) => handlePriceChange('max', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="50000"
                                    step="500"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>₹0</span>
                                    <span>₹{priceRange.max.toLocaleString()}+</span>
                                </div>
                                <button
                                    onClick={applyPriceFilter}
                                    className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                                >
                                    Apply Price Filter
                                </button>
                            </div>
                        </div>

                        {/* Clear Filters */}
                        <button
                            onClick={clearAllFilters}
                            className="w-full border border-gray-300 text-gray-700 py-2 rounded text-sm hover:bg-gray-50 transition-colors"
                        >
                            Clear All Filters
                        </button>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="lg:w-3/4">
                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Results Header */}
                    <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
                        <div className="text-gray-600">
                            {loading ? (
                                <span>Loading...</span>
                            ) : (
                                <span>Showing {products.length} of {totalProducts} products</span>
                            )}
                        </div>
                        <select
                            value={
                                sortBy === 'price' && sortOrder === 'asc' ? 'price-low' :
                                    sortBy === 'price' && sortOrder === 'desc' ? 'price-high' :
                                        sortBy === 'name' && sortOrder === 'asc' ? 'name-asc' :
                                            sortBy === 'name' && sortOrder === 'desc' ? 'name-desc' :
                                                'newest'
                            }
                            onChange={handleSortChange}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="newest">Newest First</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="name-asc">Name: A to Z</option>
                            <option value="name-desc">Name: Z to A</option>
                        </select>
                    </div>

                    {/* Loading State */}
                    {loading && products.length === 0 && (
                        <div className="text-center py-12">
                            <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
                            <p className="text-gray-500">Loading products...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <i className="fas fa-exclamation-circle text-red-500 mr-2"></i>
                                <span className="text-red-700">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Products Grid */}
                    {!loading && !error && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.map(product => {
                                    const discount = calculateDiscount(
                                        product.pricing?.price,
                                        product.pricing?.oldPrice
                                    );
                                    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
                                    const imageUrl = product.images?.[0]?.url?.startsWith('http')
                                        ? product.images[0].url
                                        : `${baseUrl}/uploads/products/${product.images?.[0]?.url}`;

                                    return (
                                        <div key={product._id} className="deal-card border p-4 rounded hover:shadow-lg transition">
                                            {/* Product Image */}
                                            <Link to={`/product/${product.slug}`} className="block relative overflow-hidden h-48 bg-gray-100">
                                                <img
                                                    src={imageUrl || '/default-product.png'}
                                                    alt={product.name}
                                                    className="product-img w-full h-48 object-cover mb-2"
                                                    onError={(e) => { e.target.src = '/default-product.png'; }}
                                                />
                                                {discount > 0 && (
                                                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                        {discount}% OFF
                                                    </span>
                                                )}
                                                {!product.stock?.inStock && (
                                                    <span className="absolute top-2 left-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">
                                                        Out of Stock
                                                    </span>
                                                )}
                                            </Link>

                                            {/* Product Info */}
                                            <Link to={`/product/${product.slug}`}>
                                                <h3 className="text-sm font-medium text-gray-800 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                                                    {product.name}
                                                </h3>
                                            </Link>

                                            {product.category && (
                                                <div className="text-xs text-gray-500 mb-2">
                                                    {typeof product.category === 'object' ? product.category.name : getCategoryName(product.category)}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <span className="text-lg font-bold text-gray-900">
                                                        {formatCurrency(product.pricing?.price)}
                                                    </span>
                                                    {product.pricing?.oldPrice && (
                                                        <span className="text-sm text-gray-400 line-through ml-2">
                                                            {formatCurrency(product.pricing.oldPrice)}
                                                        </span>
                                                    )}
                                                </div>
                                                {product.rating && (
                                                    <div className="flex items-center text-sm">
                                                        <i className="fas fa-star text-yellow-400 mr-1"></i>
                                                        <span className="text-gray-600">{product.rating}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                disabled={!product.stock?.inStock}
                                                className={`add-to-cart-btn ${product.stock?.inStock
                                                    ? 'add-to-cart-btn'
                                                    : 'cursor-not-allowed'
                                                    }`}
                                            >
                                                <i className="fas fa-shopping-cart mr-2"></i>ADD TO CART
                                            </button>
                                            <button
                                                onClick={() => handleBuyNow(product)}
                                                disabled={!product.stock?.inStock}
                                                className={`buy-now-btn ${product.stock?.inStock
                                                    ? 'buy-now-btn'
                                                    : 'cursor-not-allowed'
                                                    }`}
                                            >
                                                BUY NOW
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Empty State */}
                            {products.length === 0 && (
                                <div className="text-center py-12">
                                    <i className="fas fa-search text-5xl text-gray-400 mb-4"></i>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Found</h3>
                                    <p className="text-gray-500 mb-6">Try adjusting your filters or search term</p>
                                    <button
                                        onClick={clearAllFilters}
                                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center space-x-2 mt-8">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <i className="fas fa-chevron-left"></i>
                                    </button>

                                    {(() => {
                                        const pages = [];
                                        const maxVisible = 5;
                                        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                                        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

                                        if (endPage - startPage + 1 < maxVisible) {
                                            startPage = Math.max(1, endPage - maxVisible + 1);
                                        }

                                        for (let i = startPage; i <= endPage; i++) {
                                            pages.push(i);
                                        }

                                        return pages.map(pageNum => (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`px-3 py-2 border rounded transition-colors ${currentPage === pageNum
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        ));
                                    })()}

                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <i className="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </main>
    );
};

export default ProductsPage;