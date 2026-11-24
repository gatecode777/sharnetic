'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // localStorage is only available in the browser, so read it after mount.
  const [adminData, setAdminData] = useState({});
  useEffect(() => {
    try {
      setAdminData(JSON.parse(localStorage.getItem('adminData') || '{}'));
    } catch {
      setAdminData({});
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    router.push('/admin/login');
  };

  const isActive = (path) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            {sidebarOpen && <span>Finoxis Admin</span>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className={`fas fa-${sidebarOpen ? 'angle-left' : 'angle-right'}`}></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link
            href="/admin/dashboard"
            className={`nav-item-a ${isActive('/admin/dashboard') ? 'active' : ''}`}
          >
            <i className="fas fa-home"></i>
            {sidebarOpen && <span>Dashboard</span>}
          </Link>

          <Link
            href="/admin/enquiries"
            className={`nav-item-a ${isActive('/admin/enquiries') ? 'active' : ''}`}
          >
            <i className="fas fa-envelope-open-text text-yellow-400"></i>
            {sidebarOpen && <span>Buyer Enquiries</span>}
          </Link>

          <Link
            href="/admin/sellers"
            className={`nav-item-a ${isActive('/admin/sellers') ? 'active' : ''}`}
          >
            <i className="fas fa-industry text-blue-400"></i>
            {sidebarOpen && <span>Suppliers / Sellers</span>}
          </Link>

          <Link
            href="/admin/products"
            className={`nav-item-a ${isActive('/admin/products') ? 'active' : ''}`}
          >
            <i className="fas fa-box"></i>
            {sidebarOpen && <span>Products</span>}
          </Link>

          <Link
            href="/admin/categories"
            className={`nav-item-a ${isActive('/admin/categories') ? 'active' : ''}`}
          >
            <i className="fas fa-tags"></i>
            {sidebarOpen && <span>Categories</span>}
          </Link>

          <Link
            href="/admin/users"
            className={`nav-item-a ${isActive('/admin/users') ? 'active' : ''}`}
          >
            <i className="fas fa-users"></i>
            {sidebarOpen && <span>Users</span>}
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item-a logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <div className="header-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className="fas fa-bars"></i>
            </button>
            <div className="breadcrumb-a">
              <i className="fas fa-home"></i>
              <span>{pathname.split('/').filter(Boolean).join(' / ')}</span>
            </div>
          </div>

          <div className="header-right">
            <div className="admin-profile">
              <button
                className="profile-btn"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <div className="profile-avatar">
                  {adminData.profile ? (
                    <img src={adminData.profile} alt={adminData.firstName} />
                  ) : (
                    <i className="fas fa-user"></i>
                  )}
                </div>
                <div className="profile-info">
                  <span className="profile-name">
                    {adminData.firstName || 'Admin'} {adminData.lastName || ''}
                  </span>
                  <span className="profile-role">{adminData.role || 'Super Admin'}</span>
                </div>
                <i className="fas fa-chevron-down"></i>
              </button>

              {profileMenuOpen && (
                <div className="profile-dropdown">
                  <Link href="/admin/profile" className="dropdown-item">
                    <i className="fas fa-user"></i>
                    My Profile
                  </Link>
                  <hr />
                  <button onClick={handleLogout} className="dropdown-item logout">
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
