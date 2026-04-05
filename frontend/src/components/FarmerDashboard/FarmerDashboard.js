import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import Navbar from '../Navbar/Navbar';
import './FarmerDashboard.css';

const StarDisplay = ({ value }) => (
  <div className="star-display">
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={s <= Math.round(value) ? 'sd-filled' : 'sd-empty'}>★</span>
    ))}
  </div>
);

const FarmerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalCrops: 0,
    activeCrops: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });
  const [ratingStats, setRatingStats] = useState({
    avgRating: 0,
    avgQualityRating: 0,
    avgCostRating: 0,
    totalReviews: 0
  });
  const [recentCrops, setRecentCrops] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const cropsRes = await api.get('/crops/farmer/my-crops');
      const crops = cropsRes.data;

      const ordersRes = await api.get('/orders/farmer/orders');
      const orders = ordersRes.data;

      const reviewRes = await api.get(`/reviews/farmer/${user._id}`);
      const { avgRating, avgQualityRating, avgCostRating, totalReviews } = reviewRes.data;

      const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
      const activeCrops = crops.filter(c => c.status === 'Available').length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;

      setStats({
        totalCrops: crops.length,
        activeCrops,
        totalOrders: orders.length,
        pendingOrders,
        totalRevenue
      });

      setRatingStats({
        avgRating:        avgRating        ?? 0,
        avgQualityRating: avgQualityRating ?? 0,
        avgCostRating:    avgCostRating    ?? 0,
        totalReviews:     totalReviews     ?? 0,
      });

      setRecentCrops(crops.slice(0, 4));
      setRecentOrders(orders.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const getRatingBadge = (score) => {
    if (score >= 4.5) return { label: t('farmerDashboard.topRated'),       color: '#15803d', bg: '#dcfce7' };
    if (score >= 4.0) return { label: t('farmerDashboard.highlyRated'),     color: '#0369a1', bg: '#e0f2fe' };
    if (score >= 3.0) return { label: t('farmerDashboard.good'),            color: '#92400e', bg: '#fef3c7' };
    if (score > 0)    return { label: t('farmerDashboard.gettingStarted'),  color: '#6b7280', bg: '#f3f4f6' };
    return              { label: t('farmerDashboard.noReviewsYet'),         color: '#6b7280', bg: '#f3f4f6' };
  };

  const badge = getRatingBadge(ratingStats.avgRating);

  const getCropEmoji = (name) => {
    const emojiMap = {
      'Wheat': '🌾', 'Rice': '🍚', 'Tomato': '🍅',
      'Mango': '🥭', 'Mustard': '🌼', 'Onion': '🧅',
      'Potato': '🥔', 'Cotton': '☁️'
    };
    return emojiMap[name] || '🌱';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="farmer-dashboard">
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{t('farmerDashboard.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="farmer-dashboard">
      <Navbar />

      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="welcome-title">
              {t('farmerDashboard.hello', { name: user?.name })}
            </h1>
            <p className="welcome-subtitle">{t('farmerDashboard.subtitle')}</p>
          </div>
          <button className="btn-add-crop" onClick={() => navigate('/farmer/crops/new')}>
            {t('farmerDashboard.addNewCrop')}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon crop-icon">🌾</div>
            <div className="stat-info">
              <h3 className="stat-number">{stats.totalCrops}</h3>
              <p className="stat-label">{t('farmerDashboard.totalCrops')}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon active-icon">✅</div>
            <div className="stat-info">
              <h3 className="stat-number">{stats.activeCrops}</h3>
              <p className="stat-label">{t('farmerDashboard.activeListings')}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon order-icon">📦</div>
            <div className="stat-info">
              <h3 className="stat-number">{stats.totalOrders}</h3>
              <p className="stat-label">{t('farmerDashboard.totalOrders')}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending-icon">⏳</div>
            <div className="stat-info">
              <h3 className="stat-number">{stats.pendingOrders}</h3>
              <p className="stat-label">{t('farmerDashboard.pendingOrders')}</p>
            </div>
          </div>

          <div className="stat-card stat-card-wide">
            <div className="stat-icon revenue-icon">💰</div>
            <div className="stat-info">
              <h3 className="stat-number">₹{stats.totalRevenue.toLocaleString()}</h3>
              <p className="stat-label">{t('farmerDashboard.totalRevenue')}</p>
            </div>
          </div>
        </div>

        {/* Rating Overview Card */}
        <div className="rating-overview-card">
          <div className="rating-overview-left">
            <h2 className="section-title">{t('farmerDashboard.yourRating')}</h2>
            <p className="rating-overview-sub">{t('farmerDashboard.ratingSubtitle')}</p>

            <div className="rating-big-row">
              <span className="rating-big-number">{ratingStats.avgRating.toFixed(1)}</span>
              <div>
                <StarDisplay value={ratingStats.avgRating} />
                <span className="rating-total-reviews">
                  {ratingStats.totalReviews}{' '}
                  {ratingStats.totalReviews !== 1
                    ? t('farmerDashboard.reviews')
                    : t('farmerDashboard.review')}
                </span>
              </div>
              <span
                className="rating-badge-pill"
                style={{ color: badge.color, background: badge.bg }}
              >
                {badge.label}
              </span>
            </div>
          </div>

          <div className="rating-overview-right">
            <div className="rating-bar-row">
              <span className="rbar-label">🌾 {t('farmerDashboard.cropQuality')}</span>
              <div className="rbar-track">
                <div
                  className="rbar-fill"
                  style={{
                    width: `${(ratingStats.avgQualityRating / 5) * 100}%`,
                    background: '#22c55e'
                  }}
                />
              </div>
              <span className="rbar-score green">
                {ratingStats.avgQualityRating.toFixed(1)}
              </span>
            </div>

            <div className="rating-bar-row">
              <span className="rbar-label">💰 {t('farmerDashboard.costValue')}</span>
              <div className="rbar-track">
                <div
                  className="rbar-fill"
                  style={{
                    width: `${(ratingStats.avgCostRating / 5) * 100}%`,
                    background: '#f59e0b'
                  }}
                />
              </div>
              <span className="rbar-score amber">
                {ratingStats.avgCostRating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="dashboard-content">
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">{t('farmerDashboard.myCrops')}</h2>
              <button className="btn-view-all" onClick={() => navigate('/farmer/crops')}>
                {t('farmerDashboard.viewAll')}
              </button>
            </div>

            {recentCrops.length === 0 ? (
              <div className="empty-state">
                <p>{t('farmerDashboard.noCrops')}</p>
                <button className="btn-add" onClick={() => navigate('/farmer/crops/new')}>
                  {t('farmerDashboard.addFirstCrop')}
                </button>
              </div>
            ) : (
              <div className="crops-list">
                {recentCrops.map((crop) => (
                  <div key={crop._id} className="crop-item">
                    <div className="crop-icon-small">{getCropEmoji(crop.name)}</div>
                    <div className="crop-info">
                      <h4>{crop.name}</h4>
                      <p className="crop-details">
                        {crop.category} · {crop.quantity} kg · ₹{crop.price}/kg
                      </p>
                    </div>
                    <span className={`status-badge ${crop.status === 'Available' ? 'available' : 'sold-out'}`}>
                      {crop.status === 'Available'
                        ? t('farmerDashboard.available')
                        : t('farmerDashboard.soldOut')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">{t('farmerDashboard.recentOrders')}</h2>
              <button className="btn-view-all" onClick={() => navigate('/farmer/orders')}>
                {t('farmerDashboard.viewAll')}
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="empty-state">
                <p>{t('farmerDashboard.noOrders')}</p>
              </div>
            ) : (
              <div className="orders-list">
                {recentOrders.map((order) => (
                  <div key={order._id} className="order-item">
                    <div className="order-main">
                      <div className="order-info">
                        <h4>{order.orderId}</h4>
                        <p className="order-details">
                          {order.cropName} · {order.quantity} kg · {order.buyerName}
                        </p>
                      </div>
                      <div className="order-right">
                        <p className="order-price">₹{order.totalPrice.toLocaleString()}</p>
                        <span className={`status-badge ${order.status}`}>{order.status}</span>
                      </div>
                    </div>
                    <p className="order-date">{formatDate(order.orderDate)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2 className="section-title">{t('farmerDashboard.quickActions')}</h2>
          <div className="actions-grid">
            <button className="action-card" onClick={() => navigate('/farmer/crops/new')}>
              <span className="action-icon">➕</span>
              <span className="action-label">{t('farmerDashboard.addNewCrop')}</span>
            </button>
            <button className="action-card" onClick={() => navigate('/farmer/crops')}>
              <span className="action-icon">📝</span>
              <span className="action-label">{t('farmerDashboard.manageCrops')}</span>
            </button>
            <button className="action-card" onClick={() => navigate('/farmer/orders')}>
              <span className="action-icon">📦</span>
              <span className="action-label">{t('farmerDashboard.viewOrders')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;