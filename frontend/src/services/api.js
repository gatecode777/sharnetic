// frontend/src/services/api.js

import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const BASE_URL = API_URL.replace('/api', '');

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      localStorage.removeItem('user');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== ADMIN AUTH ====================
export const adminAuth = {
  login: (credentials) => api.post('/admin/login', credentials),
  logout: () => api.post('/admin/logout'),
  getProfile: () => api.get('/admin/me'),
  updateProfile: (data) => api.put('/admin/profile', data),
  changePassword: (data) => api.put('/admin/change-password', data),
};

// ==================== USER AUTH ====================
export const userAuth = {
  register: (data) => api.post('/users/register', data),
  loginUser: (data) => api.post('/users/login', data),
  logout: () => api.post('/users/logout'),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (formData) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then((res) => res.json());
  },
  changePassword: (data) => api.put('/users/change-password', data),
  deleteProfileImage: () => api.delete('/users/profile-image'),
};

// ==================== USER MANAGEMENT (ADMIN) ====================
export const userAPI = {
  getAll: (params) => api.get('/admin/users', { params }),
  getById: (id) => api.get(`/admin/users/${id}`),
  toggleStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
  update: (id, data) => api.put(`/admin/users/${id}`, data),
  delete: (id) => api.delete(`/admin/users/${id}`),
  getStats: () => api.get('/admin/users/stats'),
};

export const adminCategoryAPI = {
  getAll: (params) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  create: (formData) => api.post('/categories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => api.put(`/categories/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/categories/${id}`),
  toggleActive: (id) => api.put(`/categories/${id}/toggle-active`),
  deleteImage: (id) => api.delete(`/categories/${id}/image`),
};

// ==================== SELLERS / SUPPLIERS ====================
export const sellerAPI = {
  getAll: (params) => api.get('/sellers', { params }),
  getById: (id) => api.get(`/sellers/${id}`),
  create: (data) => api.post('/sellers', data),
  update: (id, data) => api.put(`/sellers/${id}`, data),
  delete: (id) => api.delete(`/sellers/${id}`),
};

// ==================== ENQUIRIES ====================
export const enquiryAPI = {
  create: (data) => api.post('/enquiries', data),
  getAll: (params) => api.get('/enquiries', { params }),
  getById: (id) => api.get(`/enquiries/${id}`),
  updateStatus: (id, status) => api.put(`/enquiries/${id}/status`, { status }),
  delete: (id) => api.delete(`/enquiries/${id}`),
  getStats: () => api.get('/enquiries/stats'),
};

// ==================== PUBLIC PRODUCT API ====================
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getByCategory: (category, params = {}) => api.get(`/products/category/${category}`, { params }),
  search: (query, params = {}) => api.get('/products/search', { params: { q: query, ...params } }),
};

// ==================== ADMIN PRODUCT API ====================
export const adminProductAPI = {
  getAll: (params) => api.get('/admin/products', { params }),
  getById: (id) => api.get(`/admin/products/${id}`),
  getStats: () => api.get('/admin/products/stats'),
  create: (formData) =>
    api.post('/admin/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, formData) =>
    api.put(`/admin/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/admin/products/${id}`),
  deleteImage: (id, filename) => api.delete(`/admin/products/${id}/images/${filename}`),
  toggleActive: (id) => api.put(`/admin/products/${id}/toggle-active`),
  toggleInStock: (id) => api.put(`/admin/products/${id}/toggle-instock`),
};

// ==================== DASHBOARD ====================
export const dashboardAPI = {
  getStats: async () => {
    try {
      const [userStats, productStats, enquiryStats] = await Promise.all([
        userAPI.getStats(),
        adminProductAPI.getStats(),
        enquiryAPI.getStats().catch(() => ({ data: { stats: {} } })),
      ]);
      return {
        data: {
          success: true,
          stats: {
            ...userStats.data.stats,
            ...productStats.data.stats,
            enquiries: enquiryStats.data?.stats?.total || 0,
            pendingEnquiries: enquiryStats.data?.stats?.pending || 0,
          },
        },
      };
    } catch {
      return { data: { success: false, message: 'Failed to fetch dashboard stats' } };
    }
  },
};

// ==================== CART (DEPRECATED) ====================
export const cartAPI = {
  getCart: () => api.get('/cart'),
  getCartCount: () => api.get('/cart/count'),
  addToCart: (productId, quantity) => api.post('/cart/add', { productId, quantity }),
  updateQuantity: (productId, quantity) => api.put('/cart/update', { productId, quantity }),
  removeItem: (productId) => api.delete(`/cart/remove/${productId}`),
  clearCart: () => api.delete('/cart/clear'),
};

// ==================== ORDERS (DEPRECATED) ====================
export const orderAPI = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: (params = {}) => api.get('/orders/my-orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id, data) => api.put(`/orders/${id}/cancel`, data),
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
  getOrderStats: () => api.get('/admin/orders/stats'),
};

// ==================== ADDRESSES ====================
export const addressAPI = {
  getAll: () => api.get('/addresses'),
  getOne: (id) => api.get(`/addresses/${id}`),
  create: (data) => api.post('/addresses', data),
  update: (id, data) => api.put(`/addresses/${id}`, data),
  delete: (id) => api.delete(`/addresses/${id}`),
  setDefault: (id) => api.put(`/addresses/${id}/default`),
};

export default api;
