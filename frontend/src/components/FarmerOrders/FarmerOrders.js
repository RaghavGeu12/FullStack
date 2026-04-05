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
                          <button
                            className="btn-confirm"
                            onClick={() => handleUpdateStatus(order._id, 'confirmed')}
                          >
                            {t('farmerOrders.confirm')}
                          </button>
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerOrders;