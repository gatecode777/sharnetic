// frontend/src/components/admin/AdminCategories.jsx
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminCategoryAPI } from '../../services/api';
import { toast } from 'react-toastify';
import '../../styles/admin/AdminCategories.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const IMAGE_URL = API_URL.replace('/api', '');

const emptyForm = {
  name: '',
  description: '',
  order: 0,
  isActive: true,
  image: null,
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchCategories();
  }, [searchTerm, filterActive]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterActive !== 'all') params.append('isActive', filterActive);

      const res = await fetch(`${API_URL}/categories?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setCategories(data.categories);
      else toast.error(data.message || 'Failed to load categories');
    } catch (err) {
      console.error('fetchCategories error:', err);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // ── Form handlers ──────────────────────────────────────────────────────────
  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview('');
    setFormData((prev) => ({ ...prev, image: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description);
      formDataToSend.append('order', parseInt(formData.order) || 0);
      formDataToSend.append('isActive', formData.isActive);
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      let response;
      if (editingCategory) {
        response = await adminCategoryAPI.update(editingCategory._id, formDataToSend);
      } else {
        response = await adminCategoryAPI.create(formDataToSend);
      }

      if (response.data.success) {
        toast.success(editingCategory ? 'Category updated' : 'Category created');
        closeModal();
        fetchCategories();
      } else {
        toast.error(response.data.message || 'Failed to save category');
      }
    } catch (err) {
      console.error('handleSubmit error:', err);
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category image?')) return;
    
    try {
      const response = await adminCategoryAPI.deleteImage(categoryId);
      if (response.data.success) {
        toast.success('Category image deleted');
        fetchCategories();
      } else {
        toast.error('Failed to delete image');
      }
    } catch (err) {
      toast.error('Failed to delete image');
    }
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      order: category.order ?? 0,
      isActive: category.isActive,
      image: category.image,
    });
    
    if (category.image) {
      setImagePreview(`${IMAGE_URL}/uploads/categories/${category.image}`);
    } else {
      setImagePreview('');
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const response = await adminCategoryAPI.delete(id);
      if (response.data.success) {
        toast.success('Category deleted');
        fetchCategories();
      } else {
        toast.error(response.data.message || 'Failed to delete category');
      }
    } catch (err) {
      console.error('handleDelete error:', err);
      toast.error('Failed to delete category');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const response = await adminCategoryAPI.toggleActive(id);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchCategories();
      } else {
        toast.error('Failed to toggle status');
      }
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  const closeModal = () => {
    if (imagePreview && !editingCategory?.image) {
      URL.revokeObjectURL(imagePreview);
    }
    setShowModal(false);
    setEditingCategory(null);
    setFormData(emptyForm);
    setImageFile(null);
    setImagePreview('');
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading && categories.length === 0) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading categories...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-categories">
        {/* Page Header */}
        <div className="page-header-u">
          <div>
            <h1>Categories Management</h1>
            <p>Manage product categories ({categories.length} total)</p>
          </div>
          <button className="btn-primary-a" onClick={() => { closeModal(); setShowModal(true); }}>
            <i className="fas fa-plus"></i> Add Category
          </button>
        </div>

        {/* Filters */}
        <div className="categories-controls">
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)} className="filter-select">
            <option value="all">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div className="categories-table-container">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Products</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
               </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    <i className="fas fa-tags"></i>
                    <p>No categories found</p>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id}>
                    <td className="category-image-cell">
                      {cat.image ? (
                        <div className="category-thumbnail-wrapper">
                          <img
                            src={`${IMAGE_URL}/uploads/categories/${cat.image}`}
                            alt={cat.name}
                            className="category-thumbnail"
                            onError={(e) => { e.target.src = '/default-category.png'; }}
                          />
                          <button
                            className="remove-image-btn-small"
                            onClick={() => handleDeleteImage(cat._id)}
                            title="Remove image"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ) : (
                        <div className="category-icon-placeholder">
                          <i className="fas fa-tag"></i>
                        </div>
                      )}
                    </td>
                    <td>
                      <strong>{cat.name}</strong>
                      {cat.description && (
                        <div className="category-description">
                          <small>{cat.description.substring(0, 50)}</small>
                        </div>
                      )}
                    </td>
                    <td>
                      <code>{cat.slug}</code>
                    </td>
                    <td>{cat.productCount ?? 0}</td>
                    <td>{cat.order}</td>
                    <td>
                      <button
                        className={`status-badge ${cat.isActive ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleActive(cat._id)}
                      >
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons-a">
                        <button className="btn-action-c btn-edit" onClick={() => handleEdit(cat)} title="Edit">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn-action-c btn-delete" onClick={() => handleDelete(cat._id)} title="Delete">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container category-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              {/* Image Upload */}
              <div className="form-group">
                <label>Category Image</label>
                <div className="image-upload-area">
                  {imagePreview ? (
                    <div className="image-preview-container">
                      <img src={imagePreview} alt="Preview" className="image-preview" />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={removeImage}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder" onClick={() => document.getElementById('categoryImage').click()}>
                      <i className="fas fa-cloud-upload-alt"></i>
                      <p>Click to upload image</p>
                      <small>JPG, PNG, WEBP — max 5MB</small>
                    </div>
                  )}
                  <input
                    type="file"
                    id="categoryImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              {/* Name */}
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInput}
                  placeholder="e.g., Electronics, Books, Clothing"
                  required
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInput}
                  placeholder="Brief description of this category..."
                  rows="3"
                />
              </div>

              {/* Order */}
              <div className="form-group">
                <label>Display Order</label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInput}
                  min="0"
                  placeholder="0"
                />
                <small style={{ color: '#888', fontSize: '12px' }}>Lower number = appears first</small>
              </div>

              {/* Active toggle */}
              <div className="form-row checkbox-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInput}
                  />
                  <span>Active (visible on storefront)</span>
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary-a" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary-a" disabled={uploading}>
                  {uploading ? (
                    <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                  ) : (
                    <><i className="fas fa-save"></i> {editingCategory ? 'Update Category' : 'Create Category'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCategories;