import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Navbar from '../Navbar/Navbar';
import './BrowseCrops.css';

const BrowseCrops = () => {
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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

  if (loading) {
    return (
      <div className="browse-crops">
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading crops...</p>
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
            <h1 className="page-title">Browse Crops 🛒</h1>
            <p className="page-subtitle">Fresh produce directly from farmers across India.</p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="filter-section">
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-btn ${filter === category ? 'active' : ''}`}
              onClick={() => setFilter(category)}
            >
              {category === 'all' ? 'All Crops' : category}
            </button>
          ))}
        </div>

        {/* Crops Grid */}
        {filteredCrops.length === 0 ? (
          <div className="empty-state">
            <p>No crops found in this category.</p>
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
                  <p className="crop-price">₹{crop.price}/kg</p>
                  
                  <div className="crop-meta">
                    <span className={`crop-status ${crop.status === 'Available' ? 'available' : 'sold-out'}`}>
                      {crop.status === 'Available' ? '✓' : '✕'} {crop.status}
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
  );
};

export default BrowseCrops;
