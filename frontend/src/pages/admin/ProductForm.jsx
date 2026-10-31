import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminProductAPI, adminCategoryAPI, sellerAPI } from '../../services/api';
import '../../styles/admin/ProductForm.css';

const MAX_IMAGES = 4;
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    seller: '',
    moq: '10 Pieces',
    unit: 'Piece',
    description: '',
    price: '',
    oldPrice: '',
    stockQuantity: '',
    inStock: true,
    isActive: true,
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sellers, setSellers] = useState([]);

  // Fetch product if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  // Fetch categories and sellers
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, sellerRes] = await Promise.all([
          adminCategoryAPI.getAll({ isActive: true }),
          sellerAPI.getAll({ limit: 100 }),
        ]);

        if (catRes.data.success) {
          setCategories(catRes.data.categories || []);
          if (!isEditMode && catRes.data.categories?.length > 0) {
            setFormData((prev) => ({ ...prev, category: catRes.data.categories[0]._id }));
          }
        }
        if (sellerRes.data.success) {
          setSellers(sellerRes.data.sellers || []);
        }
      } catch (e) {
        console.error('fetchMetadata error:', e);
      }
    };
    fetchMetadata();
  }, []);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await adminProductAPI.getById(id);
      if (response.data.success) {
        const p = response.data.product;
        setFormData({
          name: p.name || '',
          category: p.category?._id || p.category || '',
          seller: p.seller?._id || p.seller || '',
          moq: p.moq || '10 Pieces',
          unit: p.unit || 'Piece',
          description: p.description || '',
          price: p.pricing?.price ?? '',
          oldPrice: p.pricing?.oldPrice ?? '',
          stockQuantity: p.stock?.quantity ?? '',
          inStock: p.stock?.inStock ?? true,
          isActive: p.isActive ?? true,
        });
        setExistingImages(p.images || []);
      } else {
        setError('Failed to load product');
      }
    } catch (err) {
      console.error('fetchProduct error:', err);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length + imageFiles.length + files.length;
    
    if (totalImages > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (filename) => {
    if (!window.confirm('Delete this image permanently?')) return;
    try {
      const response = await adminProductAPI.deleteImage(id, filename);
      if (response.data.success) {
        setExistingImages(response.data.images);
      }
    } catch (err) {
      console.error('removeExistingImage error:', err);
      setError('Failed to delete image');
    }
  };

  const getDiscount = () => {
    const p = parseFloat(formData.price);
    const op = parseFloat(formData.oldPrice);
    if (p && op && op > p) {
      return Math.round(((op - p) / op) * 100) + '%';
    }
    return '0%';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    if (!formData.name.trim()) {
      setError('Product name is required');
      setSaving(false);
      return;
    }
    if (!formData.category) {
      setError('Category is required');
      setSaving(false);
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Valid price is required');
      setSaving(false);
      return;
    }

    try {
      const fd = new FormData();
      fd.append('name', formData.name.trim());
      fd.append('category', formData.category);
      if (formData.seller) fd.append('seller', formData.seller);
      fd.append('moq', formData.moq || '10 Pieces');
      fd.append('unit', formData.unit || 'Piece');
      fd.append('description', formData.description || '');
      fd.append('price', formData.price);
      if (formData.oldPrice) fd.append('oldPrice', formData.oldPrice);
      fd.append('stockQuantity', formData.stockQuantity || 0);
      fd.append('inStock', formData.inStock);
      fd.append('isActive', formData.isActive);
      
      imageFiles.forEach((file) => fd.append('images', file));

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('adminToken');
      const url = isEditMode
        ? `${apiUrl}/admin/products/${id}`
        : `${apiUrl}/admin/products`;

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await response.json();
      
      if (data.success) {
        navigate('/admin/products');
      } else {
        setError(data.message || 'Failed to save product');
      }
    } catch (err) {
      console.error('handleSubmit error:', err);
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading product...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="product-form">
        {/* Header */}
        <div className="form-header">
          <div>
            <h1>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
            <p>Fill in product and verified supplier details below</p>
          </div>
          <button className="btn-secondary-a" onClick={() => navigate('/admin/products')}>
            <i className="fas fa-times"></i> Cancel
          </button>
        </div>

        {error && (
          <div className="error-message" style={{
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            color: '#c53030',
          }}>
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="form-section">
            <h2>Basic Information</h2>

            <div className="form-group full-width">
              <label>Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Cotton Printed Casual Shirt"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Assigned Supplier / Manufacturer</label>
                <select 
                  name="seller" 
                  value={formData.seller} 
                  onChange={handleChange}
                >
                  <option value="">Select a Supplier</option>
                  {sellers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Minimum Order Quantity (MOQ)</label>
                <input
                  type="text"
                  name="moq"
                  value={formData.moq}
                  onChange={handleChange}
                  placeholder="e.g., 20 Pieces"
                />
              </div>

              <div className="form-group">
                <label>Unit</label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="e.g., Piece, Kg, Packet"
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed specifications, material, bulk shipping options..."
                rows="4"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="form-section">
            <h2>Wholesale Pricing</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Approx Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g., 350"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Old / MRP Price (₹)</label>
                <input
                  type="number"
                  name="oldPrice"
                  value={formData.oldPrice}
                  onChange={handleChange}
                  placeholder="e.g., 500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Discount</label>
                <input
                  type="text"
                  value={getDiscount()}
                  disabled
                  className="calculated-field"
                  style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="form-section">
            <h2>Product Images</h2>
            <div className="image-upload-area">
              <input
                type="file"
                id="images"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="images" className="upload-box" style={{ cursor: 'pointer' }}>
                <i className="fas fa-cloud-upload-alt fa-2x"></i>
                <p>Click to upload images (max {MAX_IMAGES})</p>
              </label>

              <div className="image-previews-grid" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                {existingImages.map((img) => (
                  <div key={img.url} className="preview-item" style={{ position: 'relative' }}>
                    <img
                      src={`${BASE_URL}/uploads/products/${img.url}`}
                      alt="Product"
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.url)}
                      style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', borderRadius: '50%', width: '20px', height: '20px', border: 'none' }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="preview-item" style={{ position: 'relative' }}>
                    <img
                      src={preview}
                      alt="Preview"
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', borderRadius: '50%', width: '20px', height: '20px', border: 'none' }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary-a"
              style={{ padding: '12px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}
            >
              {saving ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ProductForm;
