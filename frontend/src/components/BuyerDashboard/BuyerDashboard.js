import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import Navbar from '../Navbar/Navbar';
import './BuyerDashboard.css';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      const statsRes = await api.get('/orders/stats/buyer');
      setStats(statsRes.data);

      const cropsRes = await api.get('/crops/featured');
      setFeaturedCrops(cropsRes.data);

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
          <p>{t('buyerDashboard.loading')}</p>
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
              {t('buyerDashboard.hello', { name: user?.name })}
            </h1>
            <p className="welcome-subtitle">{t('buyerDashboard.subtitle')}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon box-icon">📦</div>
            <div className="stat-info">
              <h3 className="stat-number">{stats.ordersPlaced}</h3>
              <p className="stat-label">{t('buyerDashboard.ordersPlaced')}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon check-icon">✅</div>
            <div className="stat-info">
              <h3 className="stat-number">{stats.completed}</h3>
              <p className="stat-label">{t('buyerDashboard.completed')}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon money-icon">💰</div>
            <div className="stat-info">
              <h3 className="stat-number">₹{stats.totalSpent.toLocaleString()}</h3>
              <p className="stat-label">{t('buyerDashboard.totalSpent')}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon crop-icon">🌾</div>
            <div className="stat-info">
              <h3 className="stat-number">{availableCrops}</h3>
              <p className="stat-label">{t('buyerDashboard.availableCrops')}</p>
            </div>
          </div>
        </div>

        {/* Featured Crops */}
        <div className="featured-section">
          <h2 className="section-title">{t('buyerDashboard.featuredCrops')}</h2>

          {featuredCrops.length === 0 ? (
            <div className="empty-state">
              <p>{t('buyerDashboard.noCrops')}</p>
              <button
                className="btn-browse"
                onClick={() => navigate('/buyer/browse')}
              >
                {t('buyerDashboard.browseAll')}
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
                    <p className="crop-price">
                      {t('buyerDashboard.price', { price: crop.price })}
                    </p>

                    <div className="crop-meta">
                      <span className={`crop-status ${crop.status === 'Available' ? 'available' : 'sold-out'}`}>
                        ✓ {crop.status === 'Available'
                          ? t('buyerDashboard.available')
                          : t('buyerDashboard.soldOut')}
                      </span>
                      <p className="crop-farmer">
                        {t('buyerDashboard.qty', { qty: crop.quantity, farmer: crop.farmerName })}
                      </p>
                    </div>

                    <button
                      className="btn-order"
                      onClick={() => handleOrderNow(crop._id)}
                      disabled={crop.status === 'Sold Out'}
                    >
                      {t('buyerDashboard.orderNow')}
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

const getCropEmoji = (name) => {
  const emojiMap = {
    'Wheat': '🌾', 'Rice': '🍚', 'Tomato': '🍅',
    'Mango': '🥭', 'Mustard': '🌼', 'Onion': '🧅',
    'Potato': '🥔', 'Cotton': '☁️'
  };
  return emojiMap[name] || '🌱';
};

export default BuyerDashboard;