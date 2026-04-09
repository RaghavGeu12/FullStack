import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import Navbar from '../Navbar/Navbar';
import './FarmerOrders.css';

const FarmerOrders = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Decline modal state
  const [declineModal, setDeclineModal] = useState({ open: false, orderId: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [declining, setDeclining] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/farmer/orders');
      setOrders(data);
      setLoading(false);
    } catch (error) {
      toast.error(t('farmerOrders.errorFetch'));
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(t('farmerOrders.successStatus', { status: newStatus }));
      fetchOrders();
    } catch (error) {
      toast.error(t('farmerOrders.errorUpdate'));
    }
  };

  const openDeclineModal = (orderId) => {
    setDeclineModal({ open: true, orderId });
    setRejectionReason('');
  };

  const closeDeclineModal = () => {
    setDeclineModal({ open: false, orderId: null });
    setRejectionReason('');
  };

  const handleDeclineSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for declining the order.');
      return;
    }

    setDeclining(true);
    try {
      await api.put(`/orders/${declineModal.orderId}/status`, {
        status: 'cancelled',
        rejectionReason: rejectionReason.trim()
      });
      toast.success('Order declined successfully.');
      closeDeclineModal();
      fetchOrders();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to decline order.');
    } finally {
      setDeclining(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter);

  if (loading) {
    return (
      <div className="farmer-orders-page">
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{t('farmerOrders.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="farmer-orders-page">
      <Navbar />

      <div className="farmer-orders-container">
        <div className="orders-header">
          <div>
            <h1 className="page-title">{t('farmerOrders.title')}</h1>
            <p className="page-subtitle">{t('farmerOrders.subtitle')}</p>
          </div>
        </div>

        <div className="filter-section">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            {t('farmerOrders.all', { count: orders.length })}
          </button>
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            {t('farmerOrders.pending', { count: orders.filter(o => o.status === 'pending').length })}
          </button>
          <button
            className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
            onClick={() => setFilter('confirmed')}
          >
            {t('farmerOrders.confirmed', { count: orders.filter(o => o.status === 'confirmed').length })}
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            {t('farmerOrders.completed', { count: orders.filter(o => o.status === 'completed').length })}
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>{t('farmerOrders.noOrders')}</h3>
            <p>
              {filter === 'all'
                ? t('farmerOrders.noOrdersAll')
                : t('farmerOrders.noOrdersFilter', { filter })}
            </p>
          </div>
        ) : (
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>{t('farmerOrders.orderId')}</th>
                  <th>{t('farmerOrders.buyer')}</th>
                  <th>{t('farmerOrders.crop')}</th>
                  <th>{t('farmerOrders.qty')}</th>
                  <th>{t('farmerOrders.total')}</th>
                  <th>{t('farmerOrders.date')}</th>
                  <th>{t('farmerOrders.status')}</th>
                  <th>{t('farmerOrders.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="order-id">{order.orderId}</td>
                    <td>
                      <div className="buyer-info">
                        <strong>{order.buyerName}</strong>
                        <span className="buyer-address">{order.deliveryAddress}</span>
                      </div>
                    </td>
                    <td className="crop-name">{order.cropName}</td>
                    <td>{t('farmerOrders.quantityKg', { qty: order.quantity })}</td>
                    <td className="total-price">₹{order.totalPrice.toLocaleString()}</td>
                    <td>{formatDate(order.orderDate)}</td>
                    <td>
                      <span className={`status-badge ${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {order.status === 'pending' && (
                          <>
                            <button
                              className="btn-confirm"
                              onClick={() => handleUpdateStatus(order._id, 'confirmed')}
                            >
                              {t('farmerOrders.confirm')}
                            </button>
                            <button
                              className="btn-decline"
                              onClick={() => openDeclineModal(order._id)}
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {order.status === 'confirmed' && (
                          <button
                            className="btn-complete"
                            onClick={() => handleUpdateStatus(order._id, 'completed')}
                          >
                            {t('farmerOrders.complete')}
                          </button>
                        )}
                        {order.status === 'completed' && (
                          <span className="completed-text">
                            {t('farmerOrders.done')}
                          </span>
                        )}
                        {order.status === 'cancelled' && (
                          <span className="declined-text">Declined</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decline Modal */}
      {declineModal.open && (
        <div className="modal-overlay" onClick={closeDeclineModal}>
          <div className="decline-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Decline Order</h2>
              <button className="modal-close" onClick={closeDeclineModal}>✕</button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                Please provide a reason for declining this order. This message will be visible to the buyer.
              </p>
              <label className="reason-label">Reason for Declining <span>*</span></label>
              <textarea
                className="reason-textarea"
                rows={4}
                placeholder="e.g. Crop is no longer available due to weather damage..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                maxLength={500}
              />
              <div className="char-count">{rejectionReason.length}/500</div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel-modal" onClick={closeDeclineModal} disabled={declining}>
                Cancel
              </button>
              <button className="btn-decline-confirm" onClick={handleDeclineSubmit} disabled={declining}>
                {declining ? 'Declining...' : 'Decline Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerOrders;