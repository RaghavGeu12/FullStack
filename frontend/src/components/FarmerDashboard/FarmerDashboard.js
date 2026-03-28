import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Navbar from '../Navbar/Navbar';
import './FarmerDashboard.css';

// ── Reusable star display ─────────────────────────────────────────────────────
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
      // Fetch farmer's crops
      const cropsRes = await api.get('/crops/farmer/my-crops');
      const crops = cropsRes.data;

      // Fetch farmer's orders
      const ordersRes = await api.get('/orders/farmer/orders');
      const orders = ordersRes.data;

      // Fetch farmer's rating stats from reviews
      const reviewRes = await api.get(`/reviews/farmer/${user._id}`);
      const { avgRating, avgQualityRating, avgCostRating, totalReviews } = reviewRes.data;

      // Calculate stats
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
    if (score >= 4.5) return { label: 'Top Rated ⭐', color: '#15803d', bg: '#dcfce7' };
    if (score >= 4.0) return { label: 'Highly Rated', color: '#0369a1', bg: '#e0f2fe' };
    if (score >= 3.0) return { label: 'Good',         color: '#92400e', bg: '#fef3c7' };
    if (score > 0)    return { label: 'Getting Started', color: '#6b7280', bg: '#f3f4f6' };
    return              { label: 'No Reviews Yet',    color: '#6b7280', bg: '#f3f4f6' };
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
          <p>Loading dashboard...</p>
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
            <h1 className="welcome-title">Hello, {user?.name} 🌾</h1>
            <p className="welcome-subtitle">Welcome to your AgriConnect Farmer Dashboard.</p>
          </div>
          <button className="btn-add-crop" onClick={() => navigate('/farmer/crops/new')}>
            + Add New Crop
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon crop-icon">🌾</div>
            <div className="stat-info">
              <h3 className="stat-number">{stats.totalCrops}</h3>
              <p className="stat-label">Total Crops</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon active-icon">✅</div>
            <div className="stat-info">
              <h3 className="stat-number">{stats.activeCrops}</h3>
              <p className="stat-label">Active Listings</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon order-icon">📦</div>
            <div className="stat-info">
              <h3 className="stat-number">{stats.totalOrders}</h3>
              <p className="stat-label">Total Orders</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending-icon">⏳</div>
            <div className="stat-info">
              <h3 className="stat-number">{stats.pendingOrders}</h3>
              <p className="stat-label">Pending Orders</p>
            </div>
          </div>

          <div className="stat-card stat-card-wide">
            <div className="stat-icon revenue-icon">💰</div>
            <div className="stat-info">
              <h3 className="stat-number">₹{stats.totalRevenue.toLocaleString()}</h3>
              <p className="stat-label">Total Revenue</p>
            </div>
          </div>
        </div>

        {/* ── Rating Overview Card ───────────────────────────────────────────── */}
        <div className="rating-overview-card">
          <div className="rating-overview-left">
            <h2 className="section-title">Your Farmer Rating</h2>
            <p className="rating-overview-sub">Based on buyer reviews across all orders</p>

            <div className="rating-big-row">
              <span className="rating-big-number">{ratingStats.avgRating.toFixed(1)}</span>
              <div>
                <StarDisplay value={ratingStats.avgRating} />
                <span className="rating-total-reviews">
                  {ratingStats.totalReviews} review{ratingStats.totalReviews !== 1 ? 's' : ''}
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
            {/* Quality Rating Bar */}
            <div className="rating-bar-row">
              <span className="rbar-label">🌾 Crop Quality</span>
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

            {/* Cost Rating Bar */}
            <div className="rating-bar-row">
              <span className="rbar-label">💰 Cost & Value</span>
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
        {/* ─────────────────────────────────────────────────────────────────── */}

        {/* Two Column Layout */}
        <div className="dashboard-content">
          {/* My Crops Section */}
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">My Crops</h2>
              <button className="btn-view-all" onClick={() => navigate('/farmer/crops')}>
                View All →
              </button>
            </div>

            {recentCrops.length === 0 ? (
              <div className="empty-state">
                <p>No crops listed yet.</p>
                <button className="btn-add" onClick={() => navigate('/farmer/crops/new')}>
                  Add Your First Crop
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
                      {crop.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders Section */}
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">Recent Orders</h2>
              <button className="btn-view-all" onClick={() => navigate('/farmer/orders')}>
                View All →
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="empty-state">
                <p>No orders received yet.</p>
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
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-card" onClick={() => navigate('/farmer/crops/new')}>
              <span className="action-icon">➕</span>
              <span className="action-label">Add New Crop</span>
            </button>
            <button className="action-card" onClick={() => navigate('/farmer/crops')}>
              <span className="action-icon">📝</span>
              <span className="action-label">Manage Crops</span>
            </button>
            <button className="action-card" onClick={() => navigate('/farmer/orders')}>
              <span className="action-icon">📦</span>
              <span className="action-label">View Orders</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;