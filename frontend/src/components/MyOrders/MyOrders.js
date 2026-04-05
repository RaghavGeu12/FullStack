import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import Navbar from '../Navbar/Navbar';
import './MyOrders.css';

const MyOrders = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/my-orders');
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="my-orders">
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{t('myOrders.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders">
      <Navbar />

      <div className="orders-container">
        <div className="orders-header">
          <div>
            <h1 className="page-title">{t('myOrders.title')}</h1>
            <p className="page-subtitle">{t('myOrders.subtitle')}</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>{t('myOrders.noOrders')}</h3>
            <p>{t('myOrders.noOrdersMsg')}</p>
          </div>
        ) : (
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>{t('myOrders.orderId')}</th>
                  <th>{t('myOrders.crop')}</th>
                  <th>{t('myOrders.qty')}</th>
                  <th>{t('myOrders.total')}</th>
                  <th>{t('myOrders.farmer')}</th>
                  <th>{t('myOrders.date')}</th>
                  <th>{t('myOrders.status')}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="order-id">{order.orderId}</td>
                    <td className="crop-name">{order.cropName}</td>
                    <td>{t('myOrders.quantityKg', { qty: order.quantity })}</td>
                    <td className="total-price">₹{order.totalPrice.toLocaleString()}</td>
                    <td>{order.farmerName}</td>
                    <td>{formatDate(order.orderDate)}</td>
                    <td>
                      <span className={`status-badge ${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {orders.length > 0 && (
          <div className="pagination">
            <span>2 of 4</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;