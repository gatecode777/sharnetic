// frontend/src/pages/admin/AdminSellers.jsx
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import BulkImportModal from '../../components/admin/BulkImportModal';
import { sellerAPI, adminCategoryAPI } from '../../services/api';
import { downloadCSV, arrayToCSV, SELLER_TEMPLATE_CSV } from '../../utils/csvHelper';

const AdminSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [editingSeller, setEditingSeller] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalSellers, setTotalSellers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    mainCategory: '',
    contactPerson: '',
    email: '',
    phone: '',
    city: 'Jaipur',
    state: 'Rajasthan',
    address: '',
    businessType: 'Manufacturer & Wholesaler',
    yearEstablished: 2015,
    gstin: '',
    rating: 4.8,
    description: '',
    isVerified: true,
    trustSeal: true,
  });

  const fetchCategories = async () => {
    try {
      const res = await adminCategoryAPI.getAll({ isActive: true });
      if (res.data.success) {
        setCategories(res.data.categories || []);
      }
    } catch (e) {
      console.error('Fetch categories error:', e);
    }
  };

  const fetchSellers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (search.trim()) params.search = search.trim();
      if (selectedCategory) params.category = selectedCategory;
      const res = await sellerAPI.getAll(params);
      if (res.data.success) {
        setSellers(res.data.sellers || []);
        setTotalSellers(res.data.totalSellers || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (e) {
      console.error('Fetch sellers error:', e);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, selectedCategory]);

  useEffect(() => {
    fetchCategories();
    fetchSellers();
  }, [fetchSellers]);

  const handleOpenAdd = () => {
    setEditingSeller(null);
    setFormData({
      name: '',
      mainCategory: categories[0]?._id || '',
      contactPerson: '',
      email: '',
      phone: '',
      city: 'Jaipur',
      state: 'Rajasthan',
      address: '',
      businessType: 'Manufacturer & Wholesaler',
      yearEstablished: 2015,
      gstin: '',
      rating: 4.8,
      description: '',
      isVerified: true,
      trustSeal: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (seller) => {
    setEditingSeller(seller);
    setFormData({
      name: seller.name || '',
      mainCategory: seller.mainCategory?._id || seller.mainCategory || '',
      contactPerson: seller.contactPerson || '',
      email: seller.email || '',
      phone: seller.phone || '',
      city: seller.city || 'Jaipur',
      state: seller.state || 'Rajasthan',
      address: seller.address || '',
      businessType: seller.businessType || 'Manufacturer & Wholesaler',
      yearEstablished: seller.yearEstablished || 2015,
      gstin: seller.gstin || '',
      rating: seller.rating || 4.8,
      description: seller.description || '',
      isVerified: seller.isVerified !== undefined ? seller.isVerified : true,
      trustSeal: seller.trustSeal !== undefined ? seller.trustSeal : true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mainCategory) {
      alert('Seller Name and Main Category are required');
      return;
    }

    try {
      if (editingSeller) {
        await sellerAPI.update(editingSeller._id, formData);
      } else {
        await sellerAPI.create(formData);
      }
      setShowModal(false);
      fetchSellers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save seller');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this seller?')) return;
    try {
      await sellerAPI.delete(id);
      fetchSellers();
    } catch (err) {
      alert('Failed to delete seller');
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const res = await sellerAPI.exportAll();
      if (res.data.success && res.data.sellers?.length > 0) {
        const csv = arrayToCSV(res.data.sellers);
        downloadCSV(csv, `suppliers_directory_${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        alert('No suppliers found to export.');
      }
    } catch (err) {
      console.error('Export error:', err);
      alert(err.response?.data?.message || 'Failed to export suppliers.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex flex-wrap items-center gap-2">
              <span>Manage Verified Suppliers & Sellers</span>
              <span className="text-xs bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full border border-blue-200">
                {totalSellers.toLocaleString()} Total Suppliers
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Assign main categories to sellers, verify credentials, and manage supplier profiles
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={exporting}
              className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-sm shadow-sm flex items-center space-x-1.5 transition"
              title="Export all suppliers to CSV"
            >
              {exporting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-file-export text-blue-600"></i>
                  <span>Export CSV</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-sm shadow-sm flex items-center space-x-1.5 transition"
              title="Bulk import suppliers from CSV or JSON"
            >
              <i className="fas fa-file-import text-green-600"></i>
              <span>Bulk Import</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow flex items-center space-x-2 transition"
            >
              <i className="fas fa-plus"></i>
              <span>Add New Supplier</span>
            </button>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search input */}
            <div className="w-full sm:w-72 relative">
              <i className="fas fa-search absolute left-3 top-3 text-gray-400 text-xs"></i>
              <input
                type="text"
                placeholder="Search name, city, contact..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Rows per page selector */}
            <div className="flex items-center space-x-1.5 text-xs text-gray-600 font-semibold">
              <span>Show:</span>
              <select
                value={limit}
                onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
                className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
                <option value={250}>250 per page</option>
                <option value={500}>500 per page</option>
                <option value={1000}>1000 per page</option>
              </select>
            </div>
          </div>

          <span className="text-xs font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            Showing {sellers.length > 0 ? (page - 1) * limit + 1 : 0} – {Math.min(page * limit, totalSellers)} of {totalSellers.toLocaleString()} Suppliers
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <i className="fas fa-spinner fa-spin text-3xl mb-2 text-blue-600"></i>
              <p>Loading suppliers...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Supplier Name</th>
                    <th className="px-4 py-3">Assigned Main Category</th>
                    <th className="px-4 py-3">Contact Person & Phone</th>
                    <th className="px-4 py-3">City / State</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Catalog</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sellers.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <strong className="text-gray-900 block">{s.name}</strong>
                        <span className="text-xs text-gray-500">{s.businessType}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-md">
                          {s.mainCategory?.name || 'Unassigned'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="font-semibold text-gray-800 block">{s.contactPerson}</span>
                        <span className="text-blue-600 font-mono">{s.phone}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">
                        {s.city}, {s.state}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          ★ {s.rating}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-blue-600 text-xs">
                        {s.productCount || 0} Products
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s._id)}
                          className="px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 rounded-lg"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-gray-600 font-semibold">
                Page <strong className="text-gray-900">{page}</strong> of <strong className="text-gray-900">{totalPages}</strong> ({totalSellers.toLocaleString()} total suppliers)
              </span>

              <div className="flex items-center space-x-1.5">
                {/* Previous */}
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition ${
                    page <= 1
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-white'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100 bg-white shadow-sm'
                  }`}
                >
                  <i className="fas fa-chevron-left mr-1"></i> Prev
                </button>

                {/* Page Number Pills */}
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
                      <button
                        key={1}
                        onClick={() => setPage(1)}
                        className="w-8 h-8 rounded-lg font-bold border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                      >
                        1
                      </button>
                    );
                    if (start > 2) {
                      pages.push(<span key="dots-start" className="px-1 text-gray-400">...</span>);
                    }
                  }

                  for (let p = start; p <= end; p++) {
                    pages.push(
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg font-bold transition ${
                          page === p
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  }

                  if (end < totalPages) {
                    if (end < totalPages - 1) {
                      pages.push(<span key="dots-end" className="px-1 text-gray-400">...</span>);
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => setPage(totalPages)}
                        className="w-8 h-8 rounded-lg font-bold border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                      >
                        {totalPages}
                      </button>
                    );
                  }

                  return pages;
                })()}

                {/* Next */}
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition ${
                    page >= totalPages
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-white'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100 bg-white shadow-sm'
                  }`}
                >
                  Next <i className="fas fa-chevron-right ml-1"></i>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4"
            style={{ overflowY: 'auto' }}
            onClick={() => setShowModal(false)}
          >
            <div
              className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl"
              style={{
                maxHeight: '90vh',
                overflowY: 'auto',
                margin: 'auto 0',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="font-bold text-gray-900 text-base">
                  {editingSeller ? 'Edit Supplier' : 'Add New Supplier'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Company / Seller Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Assigned Main Category *</label>
                  <select
                    required
                    value={formData.mainCategory}
                    onChange={(e) => setFormData({ ...formData, mainCategory: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white font-medium"
                  >
                    <option value="">Select Main Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Contact Person</label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Phone / WhatsApp</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">GSTIN</label>
                    <input
                      type="text"
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Business Description</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
                  >
                    Save Supplier
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Bulk Import Modal */}
        <BulkImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          title="Bulk Import Suppliers"
          templateCsv={SELLER_TEMPLATE_CSV}
          templateFilename="suppliers_import_template.csv"
          onImport={(items) => sellerAPI.bulkImport(items)}
          onSuccess={() => {
            fetchSellers();
          }}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminSellers;

