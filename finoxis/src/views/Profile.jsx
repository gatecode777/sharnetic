'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/lib/config';
import { cleanName, cleanPhone, nameError, phoneError, phoneInputProps, NAME_MAX_LENGTH } from '@/lib/validation';

// Define URLs correctly
const IMAGE_URL = API_URL.replace('/api', ''); // For static files: http://localhost:5000

const ProfilePage = () => {
  const { user, token, logout, updateUser } = useAuth(); // Add updateUser from context
  const router = useRouter();
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
        firstName: cleanName(user.firstName || ''),
        lastName: cleanName(user.lastName || ''),
        email: user.email || '',
        phone: cleanPhone(user.phone || ''),
        profile: user.profile || ''
      });
      
      // Set image preview with correct URL
      const imageUrl = getImageUrl(user.profile);
      setImagePreview(imageUrl);
      setProfileImage(user.profile || '/default-user.jpg');
    }
  }, [user]);

  // Show message helper
  const showToastMessage = (type, text) => {
    setMessage({ type, text });
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
  };

  // ==================== PROFILE FUNCTIONS ====================
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const invalid =
      nameError(profileData.firstName, { label: 'First name' }) ||
      nameError(profileData.lastName, { label: 'Last name' }) ||
      phoneError(profileData.phone, { label: 'Phone number', required: false });
    if (invalid) {
      showToastMessage('error', invalid);
      return;
    }
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
          router.push('/');
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
              src={imagePreview || '/default-user.jpg'} 
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
                  maxLength={NAME_MAX_LENGTH}
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: cleanName(e.target.value) })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  maxLength={NAME_MAX_LENGTH}
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: cleanName(e.target.value) })}
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
                {...phoneInputProps}
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: cleanPhone(e.target.value) })}
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
              src={imagePreview || '/default-user.jpg'} 
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
          {activeTab === 'password' && renderChangePassword()}
          {activeTab === 'delete' && renderDeleteAccount()}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;