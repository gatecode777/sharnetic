// frontend/src/pages/OrderDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import '../assets/css/order-detail.css';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const IMAGE_URL = BASE_URL.replace('/api', '');

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState(0);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  useEffect(() => {
    if (order) {
      // Calculate tracking progress based on order status
      const statusMap = {
        'placed': 1,
        'confirmed': 2,
        'processing': 3,
        'shipped': 4,
        'delivered': 5,
        'cancelled': 0
      };
      setTrackingStatus(statusMap[order.status] || 0);
    }
  }, [order]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrderById(id);
      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      console.error('Fetch order error:', err);
      setError(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    setCancelling(true);
    try {
      const response = await orderAPI.cancelOrder(id, { reason: cancelReason });
      if (response.data.success) {
        setOrder(response.data.order);
        setShowCancelModal(false);
        setCancelReason('');
      } else {
        alert('Failed to cancel order');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'placed': '#f59e0b',
      'confirmed': '#3b82f6',
      'processing': '#8b5cf6',
      'shipped': '#10b981',
      'delivered': '#059669',
      'cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'placed': '📦',
      'confirmed': '✓',
      'processing': '⚙️',
      'shipped': '🚚',
      'delivered': '🏠',
      'cancelled': '❌'
    };
    return icons[status] || '📋';
  };

  const getPaymentStatusColor = (status) => {
    return status === 'paid' ? '#10b981' : status === 'failed' ? '#ef4444' : '#f59e0b';
  };

  if (loading) {
    return (
      <div className="order-details-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-details-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>{error || 'Order not found'}</h2>
          <p>We couldn't find the order you're looking for.</p>
          <button onClick={() => navigate('/profile')} className="btn-primary">
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  const canCancel = ['placed', 'confirmed'].includes(order.status);
  const canTrack = ['confirmed', 'processing', 'shipped'].includes(order.status);

  return (
    <div className="order-details-page">
      <div className="order-details-container">
        {/* Header */}
        <div className="order-header">
          <button onClick={() => navigate('/profile')} className="back-btn">
            ← Back to Orders
          </button>
          <div className="order-title">
            <h1>Order Details</h1>
            <div className="order-number">
              <span className="label">Order #</span>
              <span className="value">{order.orderNumber}</span>
            </div>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="order-summary-card">
          <div className="summary-header">
            <div className="status-badge" style={{ background: getStatusColor(order.status) }}>
              {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
            <div className="order-date">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M19 4h-2V2h-2v2H9V2H7v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10zM7 12h10v2H7v-2zm0 4h10v2H7v-2z" fill="currentColor"/>
              </svg>
              Placed on {formatDate(order.createdAt)}
            </div>
          </div>

          {canCancel && (
            <div className="cancel-action">
              <button 
                className="btn-cancel-order" 
                onClick={() => setShowCancelModal(true)}
              >
                Cancel Order
              </button>
            </div>
          )}
        </div>

        {/* Tracking Timeline */}
        {canTrack && (
          <div className="tracking-card">
            <h3>Order Tracking</h3>
            <div className="tracking-timeline">
              <div className={`timeline-step ${trackingStatus >= 1 ? 'completed' : ''}`}>
                <div className="step-icon">📦</div>
                <div className="step-label">Order Placed</div>
                <div className="step-date">{formatDate(order.createdAt)}</div>
              </div>
              <div className={`timeline-step ${trackingStatus >= 2 ? 'completed' : ''}`}>
                <div className="step-icon">✓</div>
                <div className="step-label">Confirmed</div>
                <div className="step-date">{order.confirmedAt ? formatDate(order.confirmedAt) : 'Pending'}</div>
              </div>
              <div className={`timeline-step ${trackingStatus >= 3 ? 'completed' : ''}`}>
                <div className="step-icon">⚙️</div>
                <div className="step-label">Processing</div>
                <div className="step-date">{order.processingAt ? formatDate(order.processingAt) : 'Pending'}</div>
              </div>
              <div className={`timeline-step ${trackingStatus >= 4 ? 'completed' : ''}`}>
                <div className="step-icon">🚚</div>
                <div className="step-label">Shipped</div>
                <div className="step-date">{order.shippedAt ? formatDate(order.shippedAt) : 'Pending'}</div>
              </div>
              <div className={`timeline-step ${trackingStatus >= 5 ? 'completed' : ''}`}>
                <div className="step-icon">🏠</div>
                <div className="step-label">Delivered</div>
                <div className="step-date">{order.deliveredAt ? formatDate(order.deliveredAt) : 'Pending'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="items-card">
          <h3>Order Items</h3>
          <div className="items-list">
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-image">
                  <img 
                    src={item.image ? `${IMAGE_URL}/uploads/products/${item.image}` : '/default-product.png'} 
                    alt={item.name}
                    onError={(e) => { e.target.src = '/default-product.png'; }}
                  />
                </div>
                <div className="item-details">
                  <Link to={`/products/${item.product}`} className="item-name">
                    {item.name}
                  </Link>
                  <div className="item-meta">
                    <span className="item-unit">Unit: {item.unit || 'piece'}</span>
                    <span className="item-quantity">Qty: {item.quantity}</span>
                  </div>
                </div>
                <div className="item-price">
                  ₹{item.price.toLocaleString()}
                </div>
                <div className="item-total">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="summary-card">
          <h3>Order Summary</h3>
          <div className="summary-details">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{order.pricing.subtotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>₹{order.pricing.shipping.toLocaleString()}</span>
            </div>
            {order.pricing.tax > 0 && (
              <div className="summary-row">
                <span>Tax</span>
                <span>₹{order.pricing.tax.toLocaleString()}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{order.pricing.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="shipping-card">
          <h3>Shipping Information</h3>
          <div className="shipping-details">
            <div className="address-section">
              <div className="address-label">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 12c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" fill="currentColor"/>
                </svg>
                Delivery Address
              </div>
              <div className="address-content">
                <p className="name">{order.shippingAddress.fullName}</p>
                <p className="address">{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p className="address">{order.shippingAddress.line2}</p>}
                <p className="city-state">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                <p className="country">{order.shippingAddress.country}</p>
                <p className="phone">📞 {order.shippingAddress.phone}</p>
              </div>
            </div>
            <div className="payment-section">
              <div className="payment-label">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 10h18M6 14h2M12 14h6M3 6h18v12H3V6z" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                Payment Information
              </div>
              <div className="payment-details">
                <p>
                  <strong>Method:</strong> {order.paymentMethod.toUpperCase()}
                </p>
                <p>
                  <strong>Status:</strong> 
                  <span style={{ color: getPaymentStatusColor(order.paymentStatus), marginLeft: '8px' }}>
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Notes */}
        {order.notes && (
          <div className="notes-card">
            <h3>Order Notes</h3>
            <p>{order.notes}</p>
          </div>
        )}

        {/* Cancellation Reason */}
        {order.status === 'cancelled' && order.cancelReason && (
          <div className="cancellation-card">
            <h3>Cancellation Reason</h3>
            <p>{order.cancelReason}</p>
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cancel Order</h3>
              <button className="close-modal" onClick={() => setShowCancelModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="warning-message">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8v4m0 4h.01M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <p>Are you sure you want to cancel this order?</p>
                <p className="warning-text">This action cannot be undone.</p>
              </div>
              <div className="form-group">
                <label>Reason for cancellation</label>
                <textarea
                  rows="4"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please tell us why you're cancelling this order..."
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCancelModal(false)}>
                Keep Order
              </button>
              <button 
                className="btn-danger" 
                onClick={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;