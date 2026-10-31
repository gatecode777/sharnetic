import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import BulkImportModal from '../../components/admin/BulkImportModal';
import { adminProductAPI } from '../../services/api';
import { downloadCSV, arrayToCSV, PRODUCT_TEMPLATE_CSV } from '../../utils/csvHelper';
import '../../styles/admin/AdminProducts.css';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const searchTimeoutRef = useRef(null);

  // Fetch categories for filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/categories?isActive=true`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories);
        }
      } catch (e) {
        console.error('fetchCategories error:', e);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(fetchProducts, 500);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchTerm, filterCategory, filterStatus, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminProductAPI.getAll({
        page: currentPage,
        limit: 20,
        search: searchTerm.trim(),
        category: filterCategory,
        status: filterStatus,
      });
      if (response.data.success) {
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
        setTotalProducts(response.data.totalProducts);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      const response = await adminProductAPI.delete(selectedProduct._id);
      if (response.data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== selectedProduct._id));
        setTotalProducts((t) => t - 1);
        setShowDeleteModal(false);
        setSelectedProduct(null);
        if (products.length === 1 && currentPage > 1) setCurrentPage((p) => p - 1);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const res = await adminProductAPI.exportAll({
        category: filterCategory,
        status: filterStatus,
        search: searchTerm,
      });
      if (res.data.success && res.data.products?.length > 0) {
        const csv = arrayToCSV(res.data.products);
        downloadCSV(csv, `products_catalog_${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        alert('No products found to export.');
      }
    } catch (err) {
      console.error('Export error:', err);
      alert(err.response?.data?.message || 'Failed to export products.');
    } finally {
      setExporting(false);
    }
  };

  const handleToggleActive = async (productId) => {
    try {
      const response = await adminProductAPI.toggleActive(productId);
      if (response.data.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === productId ? { ...p, isActive: response.data.isActive } : p
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleToggleInStock = async (productId) => {
    try {
      const response = await adminProductAPI.toggleInStock(productId);
      if (response.data.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === productId
              ? { ...p, stock: { ...p.stock, inStock: response.data.inStock } }
              : p
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle stock status');
    }
  };

  const getProductImage = (product, index = 0) => {
    if (product?.images?.length > 0) {
      const img = product.images[index];
      if (!img) return '/default-product.png';
      const url = typeof img === 'string' ? img : img?.url;
      if (!url) return '/default-product.png';
      return url.startsWith('http') ? url : `${BASE_URL}/uploads/products/${url}`;
    }
    return '/default-product.png';
  };

  const getDiscount = (product) => {
    const { price, oldPrice } = product.pricing || {};
    if (price && oldPrice && oldPrice > price) {
      return Math.round(((oldPrice - price) / oldPrice) * 100);
    }
    return null;
  };

  // Helper function to get category name
  const getCategoryName = (product) => {
    if (!product.category) return 'Uncategorized';

    // If category is an object with name property
    if (typeof product.category === 'object' && product.category.name) {
      return product.category.name;
    }

    // If category is a string
    if (typeof product.category === 'string') {
      return product.category.charAt(0).toUpperCase() + product.category.slice(1);
    }

    return 'Unknown';
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
    setShowViewModal(true);
  };

  const nextImage = () => {
    if (selectedProduct && selectedProduct.images) {
      setCurrentImageIndex((prev) =>
        prev + 1 >= selectedProduct.images.length ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedProduct && selectedProduct.images) {
      setCurrentImageIndex((prev) =>
        prev - 1 < 0 ? selectedProduct.images.length - 1 : prev - 1
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && products.length === 0) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading products...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-products">
        {/* Header */}
        <div className="page-header-u flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1>Products Management</h1>
            <p>Manage your product catalog ({totalProducts} total)</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={exporting}
              className="btn-secondary-a flex items-center space-x-1.5"
              title="Export all products to CSV"
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
              className="btn-secondary-a flex items-center space-x-1.5"
              title="Bulk import products from CSV or JSON"
            >
              <i className="fas fa-file-import text-green-600"></i>
              <span>Bulk Import</span>
            </button>
            <Link to="/admin/products/new" className="btn-primary-a flex items-center space-x-1.5">
              <i className="fas fa-plus"></i>
              <span>Add New Product</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="error-message" style={{
            background: '#fee', border: '1px solid #fcc',
            borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#c53030',
          }}>
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {/* Filters */}
        <div className="products-controls">
          <div className="search-bar" style={{ position: 'relative' }}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            {loading && searchTerm && (
              <i className="fas fa-spinner fa-spin" style={{
                position: 'absolute', right: '12px', top: '50%',
                transform: 'translateY(-50%)', color: '#999',
              }} />
            )}
          </div>

          <div className="filter-group">
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {products.map((product) => {
            const discount = getDiscount(product);
            return (
              <div key={product._id} className="product-card-admin">
                <div className="product-image">
                  <img
                    src={getProductImage(product)}
                    alt={product.images?.[0]?.alt || product.name}
                    onError={(e) => { e.target.src = '/default-product.png'; }}
                  />

                  {/* Active badge */}
                  <span className={`stock-badge ${product.isActive ? 'in-stock' : 'out-of-stock'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>

                  {/* In Stock badge */}
                  {!product.stock?.inStock && (
                    <span className="featured-badge" style={{ background: '#e74c3c', top: '40px' }}>
                      Out of Stock
                    </span>
                  )}
                </div>

                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-category">
                    <i className="fas fa-tag"></i>
                    {getCategoryName(product)}
                  </p>

                  <div className="product-pricing">
                    <span className="selling-price">
                      ₹{product.pricing?.price?.toLocaleString()}
                    </span>
                    {product.pricing?.oldPrice && (
                      <span className="mrp-price">
                        ₹{product.pricing.oldPrice.toLocaleString()}
                      </span>
                    )}
                    {discount && (
                      <span className="discount">{discount}% OFF</span>
                    )}
                  </div>

                  <div className="product-meta">
                    <div className="meta-item">
                      <i className="fas fa-boxes"></i>
                      <span>{product.stock?.quantity ?? 0} in stock</span>
                    </div>
                    <div className="meta-item">
                      <i className="fas fa-circle" style={{ color: product.stock?.inStock ? '#27ae60' : '#e74c3c', fontSize: '8px' }}></i>
                      <span>{product.stock?.inStock ? 'In Stock' : 'Out of Stock'}</span>
                    </div>
                  </div>

                  <div className="product-actions">
                    <Link to={`/admin/products/edit/${product._id}`} className="btn-action btn-edit">
                      <i className="fas fa-edit"></i> Edit
                    </Link>
                    <button
                      className="btn-action btn-view"
                      onClick={() => handleViewProduct(product)}
                    >
                      <i className="fas fa-eye"></i> View
                    </button>
                    <button
                      className={`btn-action ${product.isActive ? 'btn-featured' : 'btn-secondary-a'}`}
                      onClick={() => handleToggleActive(product._id)}
                      title={product.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <i className={`fas ${product.isActive ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
                    </button>
                    <button
                      className={`btn-action ${product.stock?.inStock ? 'btn-secondary-a' : 'btn-featured'}`}
                      onClick={() => handleToggleInStock(product._id)}
                      title={product.stock?.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                    >
                      <i className="fas fa-warehouse"></i>
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => { setSelectedProduct(product); setShowDeleteModal(true); }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {products.length === 0 && !loading && !error && (
          <div className="no-data">
            <i className="fas fa-box-open"></i>
            <p>No products found</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
              <i className="fas fa-chevron-left"></i> Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
              Next <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>

      {/* View Product Modal */}
      {/* View Product Modal */}
      {showViewModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content product-view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-content">
                <h2>Product Details</h2>
                <p className="modal-subtitle">View complete product information</p>
              </div>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="product-view-container">
                {/* Image Gallery */}
                <div className="product-gallery">
                  <div className="main-image">
                    <img
                      src={getProductImage(selectedProduct, currentImageIndex)}
                      alt={selectedProduct.images?.[currentImageIndex]?.alt || selectedProduct.name}
                      onError={(e) => { e.target.src = '/default-product.png'; }}
                    />

                    {selectedProduct.images?.length > 1 && (
                      <>
                        <button className="gallery-nav prev" onClick={prevImage}>
                          <i className="fas fa-chevron-left"></i>
                        </button>
                        <button className="gallery-nav next" onClick={nextImage}>
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </>
                    )}

                    {/* Status Badges */}
                    <div className="image-badges">
                      {!selectedProduct.isActive && (
                        <span className="badge badge-inactive">Inactive</span>
                      )}
                      {!selectedProduct.stock?.inStock && (
                        <span className="badge badge-outstock">Out of Stock</span>
                      )}
                      {getDiscount(selectedProduct) && (
                        <span className="badge badge-discount">{getDiscount(selectedProduct)}% OFF</span>
                      )}
                    </div>
                  </div>

                  {selectedProduct.images?.length > 1 && (
                    <div className="thumbnail-list">
                      {selectedProduct.images.map((img, idx) => (
                        <div
                          key={idx}
                          className={`thumbnail ${currentImageIndex === idx ? 'active' : ''}`}
                          onClick={() => setCurrentImageIndex(idx)}
                        >
                          <img
                            src={img.url?.startsWith('http') ? img.url : `${BASE_URL}/uploads/products/${img.url}`}
                            alt={img.alt || `${selectedProduct.name} ${idx + 1}`}
                            onError={(e) => { e.target.src = '/default-product.png'; }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="product-details">
                  <div className="details-header">
                    <h3 className="product-name">{selectedProduct.name}</h3>
                    <div className="product-slug">{selectedProduct.slug}</div>
                  </div>

                  <div className="info-grid">
                    <div className="info-section">
                      <div className="info-section-title">
                        <i className="fas fa-tag"></i>
                        <span>Category</span>
                      </div>
                      <div className="info-value category-badge">
                        {getCategoryName(selectedProduct)}
                      </div>
                    </div>

                    <div className="info-section">
                      <div className="info-section-title">
                        <i className="fas fa-chart-line"></i>
                        <span>Pricing</span>
                      </div>
                      <div className="pricing-info">
                        <div className="current-price">
                          ₹{selectedProduct.pricing?.price?.toLocaleString()}
                        </div>
                        {selectedProduct.pricing?.oldPrice && (
                          <>
                            <div className="old-price">
                              ₹{selectedProduct.pricing.oldPrice.toLocaleString()}
                            </div>
                            {getDiscount(selectedProduct) && (
                              <div className="discount-badge">
                                Save {getDiscount(selectedProduct)}%
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="info-section">
                      <div className="info-section-title">
                        <i className="fas fa-boxes"></i>
                        <span>Inventory</span>
                      </div>
                      <div className="inventory-info">
                        <div className="stock-quantity">
                          <i className="fas fa-cubes"></i>
                          <span>{selectedProduct.stock?.quantity || 0} units available</span>
                        </div>
                        <div className={`stock-status ${selectedProduct.stock?.inStock ? 'in-stock' : 'out-of-stock'}`}>
                          <i className={`fas ${selectedProduct.stock?.inStock ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                          <span>{selectedProduct.stock?.inStock ? 'In Stock' : 'Out of Stock'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="info-section">
                      <div className="info-section-title">
                        <i className="fas fa-toggle-on"></i>
                        <span>Status</span>
                      </div>
                      <div className={`status-badge ${selectedProduct.isActive ? 'active' : 'inactive'}`}>
                        <i className={`fas ${selectedProduct.isActive ? 'fa-check' : 'fa-times'}`}></i>
                        <span>{selectedProduct.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="info-section full-width">
                    <div className="info-section-title">
                      <i className="fas fa-align-left"></i>
                      <span>Description</span>
                    </div>
                    <div className="description-text">
                      {selectedProduct.description || 'No description available'}
                    </div>
                  </div>

                  <div className="info-section full-width">
                    <div className="info-section-title">
                      <i className="fas fa-clock"></i>
                      <span>Timestamps</span>
                    </div>
                    <div className="timestamps">
                      <div className="timestamp-item">
                        <i className="fas fa-calendar-plus"></i>
                        <span>Created: {formatDate(selectedProduct.createdAt)}</span>
                      </div>
                      <div className="timestamp-item">
                        <i className="fas fa-calendar-edit"></i>
                        <span>Updated: {formatDate(selectedProduct.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <Link
                      to={`/admin/products/edit/${selectedProduct._id}`}
                      className="btn-edit"
                      onClick={() => setShowViewModal(false)}
                    >
                      <i className="fas fa-edit"></i> Edit Product
                    </Link>
                    <button
                      className="btn-close"
                      onClick={() => setShowViewModal(false)}
                    >
                      <i className="fas fa-times"></i> Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button onClick={() => setShowDeleteModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <i className="fas fa-exclamation-triangle"></i>
                <p>Are you sure you want to delete <strong>{selectedProduct?.name}</strong>?</p>
                <p className="warning-text">This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary-a" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete}>
                <i className="fas fa-trash"></i> Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Bulk Import Products"
        templateCsv={PRODUCT_TEMPLATE_CSV}
        templateFilename="products_import_template.csv"
        onImport={(items) => adminProductAPI.bulkImport(items)}
        onSuccess={() => {
          fetchProducts();
        }}
      />
    </AdminLayout>
  );
};

export default AdminProducts;