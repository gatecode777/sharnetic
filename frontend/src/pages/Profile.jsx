import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { orderAPI, addressAPI } from '../services/api';
import '../assets/css/profile.css';

// Define URLs correctly
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const IMAGE_URL = API_URL.replace('/api', ''); // For static files: http://localhost:5000

const ProfilePage = () => {
  const { user, token, logout, updateUser } = useAuth(); // Add updateUser from context
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Active Tab State
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile States
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profile: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  
  // Addresses State
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false
  });
  
  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Delete Account State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showMessage, setShowMessage] = useState(false);

  // Helper function for image URLs
  const getImageUrl = (path) => {
    if (!path) return '/default-user.jpg';
    if (path.startsWith('http')) return path;
    return `${IMAGE_URL}/uploads/profiles/${path}`;
  };

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        profile: user.profile || ''
      });
      
      // Set image preview with correct URL
      const imageUrl = getImageUrl(user.profile);
      setImagePreview(imageUrl);
      setProfileImage(user.profile || '/default-user.jpg');
    }
  }, [user]);

  // Load orders
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  // Load addresses
  useEffect(() => {
    if (activeTab === 'addresses') {
      fetchAddresses();
    }
  }, [activeTab]);

  // Show message helper
  const showToastMessage = (type, text) => {
    setMessage({ type, text });
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
  };

  // ==================== PROFILE FUNCTIONS ====================
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.put(
        `${API_URL}/users/profile`,
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // Update user in context
        updateUser(response.data.user);
        
        showToastMessage('success', 'Profile updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      showToastMessage('error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToastMessage('error', 'Please select an image file');
      return;
    }
    
    // Validate file size (max 3MB - matches backend)
    if (file.size > 3 * 1024 * 1024) {
      showToastMessage('error', 'Image size should be less than 3MB');
      return;
    }
    
    setUploadingImage(true);
    
    const formData = new FormData();
    formData.append('profile', file);
    
    try {
      const response = await axios.put(
        `${API_URL}/users/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        // Update user in context with new profile data
        updateUser(response.data.user);
        
        // Update image preview
        const imageUrl = getImageUrl(response.data.user.profile);
        setImagePreview(imageUrl);
        
        // Update local profile data
        setProfileData(prev => ({
          ...prev,
          profile: response.data.user.profile
        }));
        
        showToastMessage('success', 'Profile picture updated');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToastMessage('error', error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  // ==================== ORDERS FUNCTIONS ====================
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await orderAPI.getMyOrders();
      setOrders(response.data.orders || []);
    } catch (error) {
      showToastMessage('error', 'Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  // ==================== ADDRESS FUNCTIONS ====================
  const fetchAddresses = async () => {
    try {
      const response = await addressAPI.getAll();
      setAddresses(response.data.addresses || []);
    } catch (error) {
      showToastMessage('error', 'Failed to load addresses');
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let response;
      if (editingAddress) {
        response = await addressAPI.update(editingAddress._id, addressForm);
      } else {
        response = await addressAPI.create(addressForm);
      }
      
      if (response.data.success) {
        showToastMessage('success', editingAddress ? 'Address updated' : 'Address added');
        setShowAddressForm(false);
        setEditingAddress(null);
        setAddressForm({
          label: 'Home',
          fullName: '',
          phone: '',
          line1: '',
          line2: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India',
          isDefault: false
        });
        fetchAddresses();
      }
    } catch (error) {
      showToastMessage('error', error.response?.data?.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    try {
      const response = await addressAPI.delete(addressId);
      
      if (response.data.success) {
        showToastMessage('success', 'Address deleted');
        fetchAddresses();
      }
    } catch (error) {
      showToastMessage('error', 'Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const response = await addressAPI.setDefault(addressId);
      
      if (response.data.success) {
        showToastMessage('success', 'Default address updated');
        fetchAddresses();
      }
    } catch (error) {
      showToastMessage('error', 'Failed to set default address');
    }
  };

  const editAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country,
      isDefault: address.isDefault
    });
    setShowAddressForm(true);
  };

  // ==================== PASSWORD FUNCTIONS ====================
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToastMessage('error', 'New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      showToastMessage('error', 'Password must be at least 8 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.put(
        `${API_URL}/users/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        showToastMessage('success', 'Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      showToastMessage('error', error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // ==================== DELETE ACCOUNT FUNCTIONS ====================
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      showToastMessage('error', 'Please type DELETE to confirm');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.delete(
        `${API_URL}/users/account`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        showToastMessage('success', 'Account deleted successfully');
        setTimeout(() => {
          logout();
          navigate('/');
        }, 1500);
      }
    } catch (error) {
      showToastMessage('error', error.response?.data?.message || 'Failed to delete account');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
    }
  };

  // ==================== RENDER FUNCTIONS ====================
  const renderProfile = () => (
    <div className="profile-tab-content">
      <div className="profile-header-card">
        <div className="profile-avatar-section">
          <div className="avatar-wrapper">
            <img 
              src={imagePreview} 
              alt="Profile" 
              className="profile-avatar-p" 
              onError={(e) => { e.target.src = '/default-user.jpg'; }}
            />
            <button 
              className="avatar-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <div className="spinner-small"></div>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>
          <div className="profile-info">
            <h3>{profileData.firstName} {profileData.lastName}</h3>
            <p>{profileData.email}</p>
            {profileData.phone && <p>{profileData.phone}</p>}
          </div>
        </div>
      </div>

      <div className="profile-form-card">
        <div className="card-header">
          <h3>Personal Information</h3>
          {!isEditing && (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M17 3l4 4-7 7H10v-4l7-7zM4 20h16" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleProfileUpdate} className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                required
                disabled
              />
              <small>Email cannot be changed</small>
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            <div className="detail-row">
              <span className="detail-label">Full Name</span>
              <span className="detail-value">{profileData.firstName} {profileData.lastName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email</span>
              <span className="detail-value">{profileData.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Phone</span>
              <span className="detail-value">{profileData.phone || 'Not set'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="profile-tab-content">
      <div className="orders-card">
        <div className="card-header">
          <h3>My Orders</h3>
          <span className="order-count">{orders.length} order(s)</span>
        </div>

        {ordersLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6M8 10v6M16 10v6" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <h4>No orders yet</h4>
            <p>Start shopping to see your orders here</p>
            <button className="btn-primary" onClick={() => navigate('/shop')}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-item-p">
                <div className="order-header">
                  <div className="order-info">
                    <span className="order-id">{order.orderNumber}</span>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className={`order-status status-${order.status}`}>
                    {order.status}
                  </div>
                </div>
                <div className="order-items">
                  {order.items.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="order-item-preview">
                      <img 
                        src={item.image?.startsWith('http') ? item.image : `${IMAGE_URL}/uploads/products/${item.image}`} 
                        alt={item.name} 
                        onError={(e) => { e.target.src = '/default-product.png'; }}
                      />
                      <div className="item-details">
                        <p className="item-name">{item.name}</p>
                        <p className="item-qty">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <div className="more-items">+{order.items.length - 2} more items</div>
                  )}
                </div>
                <div className="order-footer">
                  <div className="order-total">
                    Total: <strong>₹{order.pricing.total.toFixed(2)}</strong>
                  </div>
                  <button className="view-order-btn" onClick={() => navigate(`/orders/${order._id}`)}>
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderAddresses = () => (
    <div className="profile-tab-content">
      <div className="addresses-card">
        <div className="card-header">
          <h3>My Addresses</h3>
          <button className="add-address-btn" onClick={() => {
            setEditingAddress(null);
            setAddressForm({
              label: 'Home',
              fullName: '',
              phone: '',
              line1: '',
              line2: '',
              city: '',
              state: '',
              pincode: '',
              country: 'India',
              isDefault: false
            });
            setShowAddressForm(true);
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Add New Address
          </button>
        </div>

        {showAddressForm && (
          <div className="address-form-modal">
            <div className="modal-overlay" onClick={() => setShowAddressForm(false)}></div>
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                <button className="close-modal" onClick={() => setShowAddressForm(false)}>×</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAddressSubmit} className="address-form">
                  <div className="form-group">
                    <label>Address Label</label>
                    <select
                      value={addressForm.label}
                      onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                      required
                      placeholder="Recipient full name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      required
                      placeholder="10-digit mobile number"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Address Line 1 *</label>
                    <input
                      type="text"
                      value={addressForm.line1}
                      onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                      required
                      placeholder="House number, building, street"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      value={addressForm.line2}
                      onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                      placeholder="Area, landmark, etc."
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>State *</label>
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Pincode *</label>
                      <input
                        type="text"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        required
                        pattern="[0-9]{6}"
                        title="6-digit pincode"
                      />
                    </div>
                    <div className="form-group">
                      <label>Country *</label>
                      <input
                        type="text"
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                      />
                      Set as default address
                    </label>
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? 'Saving...' : (editingAddress ? 'Update Address' : 'Save Address')}
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => setShowAddressForm(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {addresses.length === 0 ? (
          <div className="empty-state">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <h4>No addresses saved</h4>
            <p>Add your first address for faster checkout</p>
          </div>
        ) : (
          <div className="addresses-list">
            {addresses.map((address) => (
              <div key={address._id} className={`address-item ${address.isDefault ? 'default' : ''}`}>
                {address.isDefault && <div className="default-badge">Default</div>}
                <div className="address-type">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    {address.label === 'Home' && <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" stroke="currentColor" strokeWidth="1.5"/>}
                    {address.label === 'Work' && <path d="M20 7h-4V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM12 4h0M12 12h0M8 12h0M16 12h0" stroke="currentColor" strokeWidth="1.5"/>}
                    {address.label === 'Other' && <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 12c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" stroke="currentColor" strokeWidth="1.5"/>}
                  </svg>
                  <span>{address.label}</span>
                </div>
                <div className="address-details">
                  <p className="address-name">{address.fullName}</p>
                  <p className="address-line">{address.line1}{address.line2 && `, ${address.line2}`}</p>
                  <p className="address-location">{address.city}, {address.state} - {address.pincode}</p>
                  <p className="address-phone">📞 {address.phone}</p>
                </div>
                <div className="address-actions">
                  <button className="address-edit" onClick={() => editAddress(address)}>
                    Edit
                  </button>
                  {!address.isDefault && (
                    <button className="address-default" onClick={() => handleSetDefaultAddress(address._id)}>
                      Set as Default
                    </button>
                  )}
                  <button className="address-delete" onClick={() => handleDeleteAddress(address._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderChangePassword = () => (
    <div className="profile-tab-content">
      <div className="password-card">
        <div className="card-header">
          <h3>Change Password</h3>
        </div>
        <form onSubmit={handlePasswordChange} className="password-form">
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              required
            />
            <small>Password must be at least 8 characters</small>
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );

  const renderDeleteAccount = () => (
    <div className="profile-tab-content">
      <div className="delete-card">
        <div className="card-header">
          <h3>Delete Account</h3>
        </div>
        <div className="delete-warning">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v4m0 4h.01M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <h4>Warning: This action is irreversible!</h4>
          <p>Deleting your account will permanently remove all your data including:</p>
          <ul>
            <li>Personal information and profile data</li>
            <li>Order history and addresses</li>
            <li>Cart items</li>
          </ul>
          <p className="warning-text">This action cannot be undone.</p>
        </div>
        
        {!showDeleteConfirm ? (
          <button className="btn-danger" onClick={() => setShowDeleteConfirm(true)}>
            Delete My Account
          </button>
        ) : (
          <div className="delete-confirm">
            <p>Type <strong>DELETE</strong> to confirm account deletion</p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE here"
              className="delete-confirm-input"
            />
            <div className="delete-actions">
              <button className="btn-danger" onClick={handleDeleteAccount} disabled={loading}>
                {loading ? 'Deleting...' : 'Permanently Delete Account'}
              </button>
              <button className="btn-secondary" onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteConfirmText('');
              }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="profile-page">
      {/* Message Toast */}
      {showMessage && (
        <div className={`profile-toast profile-toast--${message.type}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            {message.type === 'success' ? (
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2"/>
            ) : (
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            )}
          </svg>
          {message.text}
        </div>
      )}

      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="sidebar-user">
            <img 
              src={imagePreview} 
              alt="Profile" 
              className="sidebar-avatar" 
              onError={(e) => { e.target.src = '/default-user.jpg'; }}
            />
            <h3>{profileData.firstName} {profileData.lastName}</h3>
            <p>{profileData.email}</p>
          </div>
          
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              Profile
            </button>
            
            <button
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6M8 10v6M16 10v6" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              My Orders
            </button>
            
            <button
              className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
              onClick={() => setActiveTab('addresses')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              Addresses
            </button>
            
            <button
              className={`nav-item ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v4m0 4h.01M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              Change Password
            </button>
            
            <button
              className={`nav-item ${activeTab === 'delete' ? 'active' : ''}`}
              onClick={() => setActiveTab('delete')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              Delete Account
            </button>
          </nav>
        </div>

        <div className="profile-content">
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'addresses' && renderAddresses()}
          {activeTab === 'password' && renderChangePassword()}
          {activeTab === 'delete' && renderDeleteAccount()}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;