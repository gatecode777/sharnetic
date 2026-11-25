'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { sellerAPI, adminCategoryAPI } from '@/lib/api';
import EnquiryModal from '@/components/EnquiryModal';
import { sellerPath } from '@/lib/routes';

const toPage = (value) => {
  const n = parseInt(value, 10);
  return n > 0 ? n : 1;
};

// initial* props come from the server for the URL being opened (same API data),
// so the first HTML already contains the suppliers of that page.
const SellersPage = ({ initialFilters, initialData, initialCategories }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const [sellers, setSellers] = useState(initialData?.sellers || []);
  const [categories, setCategories] = useState(initialCategories || []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState('');

  const [selectedCategory, setSelectedCategory] = useState(initialFilters?.category || '');
  const [selectedCity, setSelectedCity] = useState(initialFilters?.city || '');
  const [search, setSearch] = useState(initialFilters?.search || '');
  const [page, setPage] = useState(initialFilters?.page || 1);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages || 1);
  const [totalSellers, setTotalSellers] = useState(initialData?.totalSellers || 0);

  // Enquiry modal
  const [enquirySeller, setEnquirySeller] = useState(null);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  useEffect(() => {
    if (initialCategories) return; // already rendered by the server
    const fetchCats = async () => {
      try {
        const res = await adminCategoryAPI.getAll({ isActive: true });
        if (res.data.success) {
          setCategories(res.data.categories || []);
        }
      } catch (e) {
        console.error('Fetch categories error:', e);
      }
    };
    fetchCats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(queryString);
    const cat = params.get('category');
    const city = params.get('city');
    if (cat) setSelectedCategory(cat);
    if (city) setSelectedCity(city);
    // Follows the URL, so the browser Back button returns to the previous page of suppliers.
    setPage(toPage(params.get('page')));
  }, [queryString]);

  const fetchSellers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = { page, limit: 30 };
      if (selectedCategory) params.category = selectedCategory;
      if (selectedCity) params.city = selectedCity;
      if (search.trim()) params.search = search.trim();

      const res = await sellerAPI.getAll(params);
      if (res.data.success) {
        setSellers(res.data.sellers || []);
        setTotalSellers(res.data.totalSellers || 0);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setError('Failed to load sellers');
      }
    } catch (err) {
      console.error('Fetch sellers error:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, selectedCity, search]);

  // Fetch whenever the filters change. The server already loaded the suppliers for the
  // filters the page opened with, so that first request is skipped.
  const fetchKey = JSON.stringify([page, selectedCategory, selectedCity, search]);
  const lastFetchKey = useRef(initialData ? fetchKey : null);

  useEffect(() => {
    if (lastFetchKey.current === fetchKey) return;
    lastFetchKey.current = fetchKey;
    fetchSellers();
  }, [fetchSellers, fetchKey]);

  // Crawlable pagination URL for the current filters, e.g. /sellers?city=Jaipur&page=3
  const buildHref = (overrides = {}) => {
    const values = { category: selectedCategory, city: selectedCity, page, ...overrides };
    const qs = new URLSearchParams();
    if (values.category) qs.set('category', values.category);
    if (values.city) qs.set('city', values.city);
    if (values.page > 1) qs.set('page', String(values.page));
    const s = qs.toString();
    return s ? `${pathname}?${s}` : pathname;
  };

  // Same in-place page change + scroll as before (no reload), but the address bar now shows ?page=N.
  // Ctrl/Cmd/middle-click still open the page in a new tab like any normal link.
  const goToPage = (e, target) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    setPage(target);
    if (target !== page) window.history.pushState(null, '', buildHref({ page: target }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When a filter changes, keep an existing ?page=/filter URL in step (back to page 1).
  const syncUrlAfterFilter = (overrides) => {
    if (!window.location.search) return;
    window.history.replaceState(null, '', buildHref({ ...overrides, page: 1 }));
  };

  const handleOpenEnquiry = (seller) => {
    setEnquirySeller(seller);
    setIsEnquiryOpen(true);
  };

  const cities = ['Jaipur', 'Surat', 'Jodhpur', 'Indore', 'Ahmedabad', 'New Delhi', 'Mumbai'];

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-8 mb-8 shadow-sm">
          <div className="max-w-3xl">
            <span className="bg-yellow-400 text-blue-950 font-black text-xs px-2.5 py-1 rounded uppercase tracking-wider mb-2 inline-block">
              Verified B2B Directory
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-1 mb-3">
              Verified Indian Manufacturers & Wholesalers
            </h1>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Find and connect directly with certified suppliers, manufacturers, and trade exporters assigned across major industry categories in India.
            </p>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Search Supplier Name
              </label>
              <input
                type="text"
                placeholder="e.g. Apex, Vardhman..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Main Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); syncUrlAfterFilter({ category: e.target.value }); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Main Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                City / Location
              </label>
              <select
                value={selectedCity}
                onChange={(e) => { setSelectedCity(e.target.value); setPage(1); syncUrlAfterFilter({ city: e.target.value }); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Indian Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sellers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <p className="text-red-500 font-bold">{error}</p>
          </div>
        ) : sellers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <i className="fas fa-industry text-4xl text-gray-300 mb-3"></i>
            <h3 className="text-base font-bold text-gray-800">No Verified Suppliers Found</h3>
            <p className="text-xs text-gray-500 mt-1">Try clearing your filters to see all available suppliers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellers.map((seller) => (
              <div
                key={seller._id}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {seller.mainCategory?.name || 'Main Category'}
                      </span>
                      {seller.isVerified && (
                        <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full ml-1.5 inline-flex items-center">
                          <i className="fas fa-shield-alt mr-1 text-green-600"></i> Verified
                        </span>
                      )}
                    </div>
                    {seller.rating && (
                      <span className="bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold px-2 py-0.5 rounded-md flex items-center">
                        <i className="fas fa-star text-amber-500 mr-1 text-[10px]"></i>
                        {seller.rating}
                      </span>
                    )}
                  </div>

                  <Link href={sellerPath(seller)}>
                    <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 transition mb-1 leading-snug">
                      {seller.name}
                    </h3>
                  </Link>

                  <p className="text-xs text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                    {seller.description || 'Verified manufacturer and bulk supplier on Finoxis.'}
                  </p>

                  <div className="space-y-1.5 text-xs text-gray-600 border-t border-gray-100 pt-3">
                    <div className="flex items-center">
                      <i className="fas fa-map-marker-alt text-gray-400 w-4"></i>
                      <span>{seller.city}, {seller.state}</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-user text-gray-400 w-4"></i>
                      <span>Contact: <strong>{seller.contactPerson || 'Sales Team'}</strong></span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-briefcase text-gray-400 w-4"></i>
                      <span>{seller.businessType} (Est. {seller.yearEstablished})</span>
                    </div>
                    {seller.gstin && (
                      <div className="flex items-center">
                        <i className="fas fa-file-invoice text-gray-400 w-4"></i>
                        <span>GSTIN: <span className="font-mono text-gray-800">{seller.gstin}</span></span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <i className="fas fa-boxes text-gray-400 w-4"></i>
                      <span className="font-bold text-blue-700">{seller.productCount || 0} Listed Products</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEnquiry(seller)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition shadow flex items-center justify-center space-x-1.5"
                  >
                    <i className="fas fa-paper-plane"></i>
                    <span>Send Enquiry</span>
                  </button>
                  <Link
                    href={sellerPath(seller)}
                    className="px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                  >
                    View Catalog
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 bg-white p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
            <span className="text-gray-600 font-semibold">
              Showing Page <strong className="text-gray-900">{page}</strong> of <strong className="text-gray-900">{totalPages}</strong> ({totalSellers.toLocaleString()} Total Suppliers)
            </span>

            <div className="flex items-center space-x-1.5">
              {/* Real <a href> links so Google can follow every page; disabled state unchanged. */}
              {page <= 1 ? (
                <button
                  type="button"
                  disabled
                  className="px-3 py-1.5 rounded-lg font-bold border transition border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                >
                  <i className="fas fa-chevron-left mr-1"></i> Prev
                </button>
              ) : (
                <a
                  href={buildHref({ page: page - 1 })}
                  rel="prev"
                  onClick={(e) => goToPage(e, page - 1)}
                  className="px-3 py-1.5 rounded-lg font-bold border transition border-gray-300 text-gray-700 hover:bg-gray-100 bg-white shadow-sm"
                >
                  <i className="fas fa-chevron-left mr-1"></i> Prev
                </a>
              )}

              {(() => {
                const pages = [];
                const maxButtons = 5;
                let start = Math.max(1, page - 2);
                let end = Math.min(totalPages, start + maxButtons - 1);
                if (end - start + 1 < maxButtons) {
                  start = Math.max(1, end - maxButtons + 1);
                }

                if (start > 1) {
                  pages.push(
                    <a
                      key={1}
                      href={buildHref({ page: 1 })}
                      onClick={(e) => goToPage(e, 1)}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-lg font-bold border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                    >
                      1
                    </a>
                  );
                  if (start > 2) pages.push(<span key="dots-start" className="px-1 text-gray-400">...</span>);
                }

                for (let p = start; p <= end; p++) {
                  pages.push(
                    <a
                      key={p}
                      href={buildHref({ page: p })}
                      aria-current={page === p ? 'page' : undefined}
                      onClick={(e) => goToPage(e, p)}
                      className={`w-8 h-8 inline-flex items-center justify-center rounded-lg font-bold transition ${
                        page === p
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </a>
                  );
                }

                if (end < totalPages) {
                  if (end < totalPages - 1) pages.push(<span key="dots-end" className="px-1 text-gray-400">...</span>);
                  pages.push(
                    <a
                      key={totalPages}
                      href={buildHref({ page: totalPages })}
                      onClick={(e) => goToPage(e, totalPages)}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-lg font-bold border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                    >
                      {totalPages}
                    </a>
                  );
                }

                return pages;
              })()}

              {page >= totalPages ? (
                <button
                  type="button"
                  disabled
                  className="px-3 py-1.5 rounded-lg font-bold border transition border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                >
                  Next <i className="fas fa-chevron-right ml-1"></i>
                </button>
              ) : (
                <a
                  href={buildHref({ page: page + 1 })}
                  rel="next"
                  onClick={(e) => goToPage(e, page + 1)}
                  className="px-3 py-1.5 rounded-lg font-bold border transition border-gray-300 text-gray-700 hover:bg-gray-100 bg-white shadow-sm"
                >
                  Next <i className="fas fa-chevron-right ml-1"></i>
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        seller={enquirySeller}
      />
    </div>
  );
};

export default SellersPage;

