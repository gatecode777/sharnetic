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

  const [imageUrls, setImageUrls] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [bulkUrlInput, setBulkUrlInput] = useState('');
  const [showBulkUrlModal, setShowBulkUrlModal] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
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
        const existingUrls = (p.images || []).map((img) => img.url).filter(Boolean);
        setImageUrls(existingUrls);
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

  const handleAddImageUrl = (e) => {
    if (e) e.preventDefault();
    const url = urlInput.trim();
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('Please enter a valid image URL starting with http:// or https://');
      return;
    }

    if (imageUrls.length + imageFiles.length >= MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    if (imageUrls.includes(url)) {
      setError('This image URL is already in the list');
      return;
    }

    setImageUrls((prev) => [...prev, url]);
    setUrlInput('');
    setError('');
  };

  const handleAddBulkUrls = (e) => {
    if (e) e.preventDefault();
    if (!bulkUrlInput.trim()) return;

    const urls = bulkUrlInput
      .split(/[\n,;]+/)
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http://') || u.startsWith('https://'));

    if (urls.length === 0) {
      setError('No valid http/https URLs found.');
      return;
    }

    const availableSlots = MAX_IMAGES - (imageUrls.length + imageFiles.length);
    if (availableSlots <= 0) {
      setError(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }

    const toAdd = urls.slice(0, availableSlots).filter((u) => !imageUrls.includes(u));
    setImageUrls((prev) => [...prev, ...toAdd]);
    setBulkUrlInput('');
    setShowBulkUrlModal(false);
    setError('');
  };

  const removeImageUrl = (index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = imageUrls.length + imageFiles.length + files.length;
    
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
      
      // Pass all image URLs to save in database
      fd.append('imageUrls', JSON.stringify(imageUrls));

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2>Product Images ({imageUrls.length + imageFiles.length}/{MAX_IMAGES})</h2>
              <button
                type="button"
                onClick={() => setShowBulkUrlModal(!showBulkUrlModal)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontWeight: '600',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <i className="fas fa-layer-group"></i>
                {showBulkUrlModal ? 'Hide Bulk Paste' : 'Paste Multiple URLs'}
              </button>
            </div>

            {/* Quick paste multiple URLs box */}
            {showBulkUrlModal && (
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '10px',
                padding: '12px',
                marginBottom: '15px'
              }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#1e40af', marginBottom: '6px' }}>
                  Paste multiple image URLs (separated by new line or comma):
                </label>
                <textarea
                  rows="3"
                  value={bulkUrlInput}
                  onChange={(e) => setBulkUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-1...&#10;https://images.unsplash.com/photo-2..."
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #93c5fd',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddBulkUrls}
                  style={{
                    marginTop: '8px',
                    padding: '6px 14px',
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <i className="fas fa-plus mr-1"></i> Add URLs
                </button>
              </div>
            )}

            {/* Paste Single Image URL Input */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>
                Paste Image URL (Web link, CDN, or Cloud URL)
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddImageUrl();
                    }
                  }}
                  placeholder="Paste image link here (e.g. https://example.com/product.jpg)..."
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    border: '1.5px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  disabled={imageUrls.length + imageFiles.length >= MAX_IMAGES}
                  style={{
                    padding: '10px 18px',
                    background: imageUrls.length + imageFiles.length >= MAX_IMAGES ? '#9ca3af' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: imageUrls.length + imageFiles.length >= MAX_IMAGES ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className="fas fa-plus"></i>
                  <span>Add URL</span>
                </button>
              </div>
              <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                Paste any online image URL and click "Add URL". Image is saved directly into the database.
              </p>
            </div>

            {/* Image Previews Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '12px',
              marginTop: '12px'
            }}>
              {imageUrls.map((url, index) => (
                <div
                  key={index}
                  style={{
                    border: '1.5px solid #e5e7eb',
                    borderRadius: '10px',
                    padding: '6px',
                    background: '#ffffff',
                    position: 'relative',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <div style={{ height: '110px', width: '100%', borderRadius: '6px', overflow: 'hidden', position: 'relative', background: '#f3f4f6' }}>
                    <img
                      src={url.startsWith('http') ? url : `${BASE_URL}/uploads/products/${url}`}
                      alt={`Product ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-product.png';
                      }}
                    />
                    {index === 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '4px',
                        left: '4px',
                        background: '#2563eb',
                        color: 'white',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        Main
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImageUrl(index)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: '#ef4444',
                        color: 'white',
                        borderRadius: '50%',
                        width: '22px',
                        height: '22px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
                      }}
                      title="Remove image"
                    >
                      &times;
                    </button>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      color: '#6b7280',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginTop: '4px',
                      padding: '0 2px'
                    }}
                    title={url}
                  >
                    {url}
                  </span>
                </div>
              ))}

              {/* Local File Previews */}
              {imagePreviews.map((preview, index) => (
                <div
                  key={`file-${index}`}
                  style={{
                    border: '1.5px solid #e5e7eb',
                    borderRadius: '10px',
                    padding: '6px',
                    background: '#ffffff',
                    position: 'relative',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <div style={{ height: '110px', width: '100%', borderRadius: '6px', overflow: 'hidden', position: 'relative', background: '#f3f4f6' }}>
                    <img
                      src={preview}
                      alt="Uploaded File"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span style={{
                      position: 'absolute',
                      top: '4px',
                      left: '4px',
                      background: '#9333ea',
                      color: 'white',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      Local File
                    </span>
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: '#ef4444',
                        color: 'white',
                        borderRadius: '50%',
                        width: '22px',
                        height: '22px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      &times;
                    </button>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      color: '#6b7280',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginTop: '4px',
                      padding: '0 2px'
                    }}
                  >
                    {imageFiles[index]?.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Optional Local File Upload */}
            {imageUrls.length + imageFiles.length < MAX_IMAGES && (
              <div style={{
                marginTop: '15px',
                paddingTop: '12px',
                borderTop: '1px solid #f3f4f6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
                color: '#6b7280'
              }}>
                <span>Need to upload from local machine instead?</span>
                <label style={{ color: '#2563eb', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>
                  <i className="fas fa-upload mr-1"></i> Browse Local File
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            )}
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
