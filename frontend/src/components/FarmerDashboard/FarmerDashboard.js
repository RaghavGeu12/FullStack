import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Navbar from '../Navbar/Navbar';
import './FarmerDashboard.css';

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

      setRecentCrops(crops.slice(0, 4));
      setRecentOrders(orders.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const getCropEmoji = (name) => {
    const emojiMap = {
      'Wheat': '🌾',
      'Rice': '🍚',
      'Tomato': '🍅',
      'Mango': '🥭',
      'Mustard': '🌼',
      'Onion': '🧅',
      'Potato': '🥔',
      'Cotton': '☁️'
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
            <h1 className="welcome-title">
              Hello, {user?.name} 🌾
            </h1>
            <p className="welcome-subtitle">Welcome to your AgriConnect Farmer Dashboard.</p>
          </div>
          <button 
            className="btn-add-crop"
            onClick={() => navigate('/farmer/crops/new')}
          >
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

        {/* Two Column Layout */}
        <div className="dashboard-content">
          {/* My Crops Section */}
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">My Crops</h2>
              <button 
                className="btn-view-all"
                onClick={() => navigate('/farmer/crops')}
              >
                View All →
              </button>
            </div>

            {recentCrops.length === 0 ? (
              <div className="empty-state">
                <p>No crops listed yet.</p>
                <button 
                  className="btn-add"
                  onClick={() => navigate('/farmer/crops/new')}
                >
                  Add Your First Crop
                </button>
              </div>
            ) : (
              <div className="crops-list">
                {recentCrops.map((crop) => (
                  <div key={crop._id} className="crop-item">
                    <div className="crop-icon-small">
                      {getCropEmoji(crop.name)}
                    </div>
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
              <button 
                className="btn-view-all"
                onClick={() => navigate('/farmer/orders')}
              >
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
                        <span className={`status-badge ${order.status}`}>
                          {order.status}
                        </span>
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
            <button 
              className="action-card"
              onClick={() => navigate('/farmer/crops/new')}
            >
              <span className="action-icon">➕</span>
              <span className="action-label">Add New Crop</span>
            </button>
            <button 
              className="action-card"
              onClick={() => navigate('/farmer/crops')}
            >
              <span className="action-icon">📝</span>
              <span className="action-label">Manage Crops</span>
            </button>
            <button 
              className="action-card"
              onClick={() => navigate('/farmer/orders')}
            >
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