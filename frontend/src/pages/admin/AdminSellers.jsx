// frontend/src/pages/admin/AdminSellers.jsx
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { sellerAPI, adminCategoryAPI } from '../../services/api';

const AdminSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSeller, setEditingSeller] = useState(null);

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
      const params = { limit: 50 };
      if (search.trim()) params.search = search.trim();
      const res = await sellerAPI.getAll(params);
      if (res.data.success) {
        setSellers(res.data.sellers || []);
      }
    } catch (e) {
      console.error('Fetch sellers error:', e);
    } finally {
      setLoading(false);
    }
  }, [search]);

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

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Verified Suppliers & Sellers</h1>
            <p className="text-sm text-gray-500 mt-1">
              Assign main categories to sellers, verify credentials, and manage supplier profiles
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow flex items-center space-x-2"
          >
            <i className="fas fa-plus"></i>
            <span>Add New Supplier</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex items-center justify-between">
          <div className="w-72">
            <input
              type="text"
              placeholder="Search supplier name, city, contact..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span className="text-xs font-semibold text-gray-500">
            {sellers.length} Suppliers Listed
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
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
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
      </div>
    </AdminLayout>
  );
};

export default AdminSellers;

