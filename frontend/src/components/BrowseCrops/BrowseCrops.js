import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import Navbar from '../Navbar/Navbar';
import './BrowseCrops.css';

const StarRating = ({ rating, totalReviews }) => {
  const filled = Math.round(rating);
  return (
    <div className="farmer-rating">
      <div className="stars">
        {[1, 2, 3, 4, 5].map((s) => (
          <span key={s} className={s <= filled ? 'star filled' : 'star empty'}>★</span>
        ))}
      </div>
      <span className="rating-text">
        {rating > 0 ? `${rating.toFixed(1)}` : 'No ratings'}
        {totalReviews > 0 && <span className="review-count"> ({totalReviews})</span>}
      </span>
    </div>
  );
};

const BrowseCrops = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [revealedPhones, setRevealedPhones] = useState({}); 
  
  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      const { data } = await api.get('/crops');
      setCrops(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching crops:', error);
      setLoading(false);
    }
  };

  const filteredCrops = filter === 'all'
    ? crops
    : crops.filter(crop => crop.category === filter);

  const categories = ['all', 'Grains', 'Vegetables', 'Fruits', 'Oilseeds'];

  const handleOrderNow = (cropId) => {
    navigate(`/buyer/order/${cropId}`);
  };

  
  const togglePhone = (cropId) => {
    setRevealedPhones(prev => ({ ...prev, [cropId]: !prev[cropId] }));
  };

  const getCropEmoji = (name) => {
    const emojiMap = {
      'Wheat': '🌾', 'Rice': '🍚', 'Tomato': '🍅',
      'Mango': '🥭', 'Mustard': '🌼', 'Onion': '🧅',
      'Potato': '🥔', 'Cotton': '☁️'
    };
    return emojiMap[name] || '🌱';
  };

  if (loading) {
    return (
      <div className="browse-crops">
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{t('browseCrops.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="browse-crops">
      <Navbar />

      <div className="browse-container">
        <div className="browse-header">
          <div>
            <h1 className="page-title">{t('browseCrops.title')}</h1>
            <p className="page-subtitle">{t('browseCrops.subtitle')}</p>
          </div>
        </div>

        
        <div className="filter-section">
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-btn ${filter === category ? 'active' : ''}`}
              onClick={() => setFilter(category)}
            >
              {category === 'all' ? t('browseCrops.allCrops') : category}
            </button>
          ))}
        </div>

       
        {filteredCrops.length === 0 ? (
          <div className="empty-state">
            <p>{t('browseCrops.noCrops')}</p>
          </div>
        ) : (
          <div className="crops-grid">
            {filteredCrops.map((crop) => (
              <div key={crop._id} className="crop-card">
                <div className="crop-image">
                  {getCropEmoji(crop.name)}
                </div>
                <div className="crop-details">
                  <h3 className="crop-name">{crop.name}</h3>
                  <p className="crop-category">{crop.category} · {crop.state}</p>
                  <p className="crop-price">
                    {t('browseCrops.price', { price: crop.price })}
                  </p>

                  <div className="crop-meta">
                    <span className={`crop-status ${crop.status === 'Available' ? 'available' : 'sold-out'}`}>
                      {crop.status === 'Available' ? '✓' : '✕'}{' '}
                      {crop.status === 'Available'
                        ? t('browseCrops.available')
                        : t('browseCrops.soldOut')}
                    </span>
                    <p className="crop-farmer">
                      {t('browseCrops.qty', { qty: crop.quantity, farmer: crop.farmerName })}
                    </p>
                  </div>

                  <StarRating
                    rating={crop.farmerAvgRating ?? 0}
                    totalReviews={crop.farmerTotalReviews ?? 0}
                  />

                  
                  <div className="farmer-contact">
                    <div className="farmer-contact-header">
                      <span className="farmer-contact-label">📞 {t('browseCrops.farmerContact')}</span>
                      {crop.farmer?.phone ? (
                        <button
                          className="reveal-phone-btn"
                          onClick={() => togglePhone(crop._id)}
                        >
                          {revealedPhones[crop._id]
                            ? t('browseCrops.hideNumber')
                            : t('browseCrops.showNumber')}
                        </button>
                      ) : (
                        <span className="no-phone">{t('browseCrops.noPhone')}</span>
                      )}
                    </div>

                    {revealedPhones[crop._id] && crop.farmer?.phone && (
                      <a
                        href={`tel:${crop.farmer.phone}`}
                        className="phone-number"
                      >
                        📱 {crop.farmer.phone}
                      </a>
                    )}
                  </div>

                  <button
                    className="btn-order"
                    onClick={() => handleOrderNow(crop._id)}
                    disabled={crop.status === 'Sold Out'}
                  >
                    {t('browseCrops.orderNow')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseCrops;