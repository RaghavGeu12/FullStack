import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Navbar from '../Navbar/Navbar';
import './BuyerDashboard.css';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    ordersPlaced: 0,
    completed: 0,
    totalSpent: 0,
    pending: 0
  });
  const [featuredCrops, setFeaturedCrops] = useState([]);
  const [availableCrops, setAvailableCrops] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch buyer stats
      const statsRes = await api.get('/orders/stats/buyer');
      setStats(statsRes.data);

      // Fetch featured crops
      const cropsRes = await api.get('/crops/featured');
      setFeaturedCrops(cropsRes.data);

      // Get all available crops count
      const allCropsRes = await api.get('/crops');
      const available = allCropsRes.data.filter(crop => crop.status === 'Available').length;
      setAvailableCrops(available);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleOrderNow = (cropId) => {
    navigate(`/buyer/order/${cropId}`);
  };

  if (loading) {
    return (
      <div className="buyer-dashboard">
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="buyer-dashboard">
      <Navbar />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="welcome-title">
              Hello, {user?.name} 🛒
            </h1>
            <p className="welcome-subtitle">Welcome to AgriConnect Buyer Dashboard.</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon box-icon">📦</div>
            <div className="stat-info">
              <h3 className="stat-number">{stats.ordersPlaced}</h3>
              <p className="stat-label">Orders Placed</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon check-icon">✅</div>
            <div className="stat-info">
              <h3 className="stat-number">{stats.completed}</h3>
              <p className="stat-label">Completed</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon money-icon">💰</div>
            <div className="stat-info">
              <h3 className="stat-number">₹{stats.totalSpent.toLocaleString()}</h3>
              <p className="stat-label">Total Spent</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon crop-icon">🌾</div>
            <div className="stat-info">
              <h3 className="stat-number">{availableCrops}</h3>
              <p className="stat-label">Available Crops</p>
            </div>
          </div>
        </div>

        {/* Featured Crops */}
        <div className="featured-section">
          <h2 className="section-title">Featured Crops</h2>
          
          {featuredCrops.length === 0 ? (
            <div className="empty-state">
              <p>No crops available at the moment.</p>
              <button 
                className="btn-browse"
                onClick={() => navigate('/buyer/browse')}
              >
                Browse All Crops
              </button>
            </div>
          ) : (
            <div className="crops-grid">
              {featuredCrops.map((crop) => (
                <div key={crop._id} className="crop-card">
                  <div className="crop-image">
                    {getCropEmoji(crop.name)}
                  </div>
                  <div className="crop-details">
                    <h3 className="crop-name">{crop.name}</h3>
                    <p className="crop-category">{crop.category} · {crop.state}</p>
                    <p className="crop-price">₹{crop.price}/kg</p>
                    
                    <div className="crop-meta">
                      <span className={`crop-status ${crop.status === 'Available' ? 'available' : 'sold-out'}`}>
                        ✓ {crop.status}
                      </span>
                      <p className="crop-farmer">
                        Qty: {crop.quantity} kg · By {crop.farmerName}
                      </p>
                    </div>

                    <button 
                      className="btn-order"
                      onClick={() => handleOrderNow(crop._id)}
                      disabled={crop.status === 'Sold Out'}
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get crop emoji
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

export default BuyerDashboard;
