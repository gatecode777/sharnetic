// frontend/src/pages/admin/AdminEnquiries.jsx
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { enquiryAPI } from '../../services/api';

const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, contacted: 0, closed: 0 });
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await enquiryAPI.getStats();
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (e) {
      console.error('Fetch enquiry stats error:', e);
    }
  };

  const fetchEnquiries = useCallback(async () => {
    try {
      setLoading(true);
      const params = { limit: 50 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await enquiryAPI.getAll(params);
      if (res.data.success) {
        setEnquiries(res.data.enquiries || []);
      }
    } catch (e) {
      console.error('Fetch enquiries error:', e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchStats();
    fetchEnquiries();
  }, [fetchEnquiries]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await enquiryAPI.updateStatus(id, newStatus);
      fetchEnquiries();
      fetchStats();
      if (selectedEnquiry && selectedEnquiry._id === id) {
        setSelectedEnquiry((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      await enquiryAPI.delete(id);
      fetchEnquiries();
      fetchStats();
      if (selectedEnquiry && selectedEnquiry._id === id) {
        setSelectedEnquiry(null);
      }
    } catch (e) {
      alert('Failed to delete enquiry');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">B2B Buyer Enquiries</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage incoming buying leads and requirement enquiries submitted to suppliers
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-xs text-gray-500 font-semibold uppercase">Total Leads</span>
            <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm bg-amber-50">
            <span className="text-xs text-amber-700 font-semibold uppercase">Pending</span>
            <div className="text-2xl font-bold text-amber-800 mt-1">{stats.pending}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm bg-blue-50">
            <span className="text-xs text-blue-700 font-semibold uppercase">Contacted</span>
            <div className="text-2xl font-bold text-blue-800 mt-1">{stats.contacted}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm bg-green-50">
            <span className="text-xs text-green-700 font-semibold uppercase">Closed</span>
            <div className="text-2xl font-bold text-green-800 mt-1">{stats.closed}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search buyer name, email, phone, product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-gray-600">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white font-medium"
            >
              <option value="all">All Enquiries</option>
              <option value="Pending">Pending</option>
              <option value="Contacted">Contacted</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Enquiries Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <i className="fas fa-spinner fa-spin text-3xl mb-2 text-blue-600"></i>
              <p>Loading enquiries...</p>
            </div>
          ) : enquiries.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <i className="fas fa-inbox text-4xl mb-2 text-gray-300"></i>
              <p>No enquiries found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Buyer Details</th>
                    <th className="px-4 py-3">Product Required</th>
                    <th className="px-4 py-3">Target Supplier</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {enquiries.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <strong className="text-gray-900 block">{item.buyerName}</strong>
                        <span className="text-xs text-blue-600 block">{item.buyerPhone}</span>
                        <span className="text-xs text-gray-400 block">{item.buyerEmail}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {item.productName}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">
                        {item.sellerName || item.seller?.name || 'General Requirement'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item._id, e.target.value)}
                          className={`text-xs font-bold px-2 py-1 rounded-lg border focus:outline-none ${
                            item.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : item.status === 'Contacted'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : 'bg-green-100 text-green-800 border-green-300'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Contacted">Contacted</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => setSelectedEnquiry(item)}
                          className="px-2.5 py-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="px-2.5 py-1 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 rounded-lg"
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

        {/* View Modal */}
        {selectedEnquiry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="font-bold text-gray-900 text-base">Enquiry Lead Details</h3>
                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-gray-500 uppercase block font-semibold">Product Name</span>
                  <strong className="text-gray-900">{selectedEnquiry.productName}</strong>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase block font-semibold">Assigned Supplier</span>
                  <strong className="text-blue-700">{selectedEnquiry.sellerName || 'General Requirement'}</strong>
                </div>
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border">
                  <div>
                    <span className="text-xs text-gray-500 block">Buyer Name</span>
                    <strong>{selectedEnquiry.buyerName}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Phone</span>
                    <strong>{selectedEnquiry.buyerPhone}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Email</span>
                    <span className="break-all">{selectedEnquiry.buyerEmail}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Quantity</span>
                    <strong>{selectedEnquiry.quantity}</strong>
                  </div>
                </div>
                {selectedEnquiry.message && (
                  <div>
                    <span className="text-xs text-gray-500 uppercase block font-semibold">Buyer Message</span>
                    <p className="bg-gray-50 p-3 rounded-lg text-xs text-gray-700 mt-1 whitespace-pre-wrap border">
                      {selectedEnquiry.message}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-xs text-gray-500 uppercase block font-semibold mb-1">Status</span>
                  <select
                    value={selectedEnquiry.status}
                    onChange={(e) => handleStatusChange(selectedEnquiry._id, e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-full font-semibold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Contacted">Contacted</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t flex justify-end">
                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminEnquiries;

