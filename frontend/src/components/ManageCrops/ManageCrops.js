import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Navbar from '../Navbar/Navbar';
import './ManageCrops.css';

const ManageCrops = () => {
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      const { data } = await api.get('/crops/farmer/my-crops');
      setCrops(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch crops');
      setLoading(false);
    }
  };

  const handleDelete = async (cropId, cropName) => {
    if (window.confirm(`Are you sure you want to delete ${cropName}?`)) {
      try {
        await api.delete(`/crops/${cropId}`);
        toast.success('Crop deleted successfully');
        fetchCrops();
      } catch (error) {
        toast.error('Failed to delete crop');
      }
    }
  };

  const handleToggleStatus = async (cropId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Available' ? 'Sold Out' : 'Available';
      await api.put(`/crops/${cropId}`, { status: newStatus });
      toast.success(`Crop marked as ${newStatus}`);
      fetchCrops();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredCrops = filter === 'all' 
    ? crops 
    : crops.filter(crop => crop.status.toLowerCase().replace(' ', '-') === filter);

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
      <div className="manage-crops-page">
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading crops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-crops-page">
      <Navbar />
      
      <div className="manage-crops-container">
        <div className="manage-header">
          <div>
            <h1 className="page-title">My Crops 🌾</h1>
            <p className="page-subtitle">Manage your agricultural listings</p>
          </div>
          <button 
            className="btn-add-new"
            onClick={() => navigate('/farmer/crops/new')}
          >
            + Add New Crop
          </button>
        </div>

        <div className="filter-section">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({crops.length})
          </button>
          <button
            className={`filter-btn ${filter === 'available' ? 'active' : ''}`}
            onClick={() => setFilter('available')}
          >
            Available ({crops.filter(c => c.status === 'Available').length})
          </button>
          <button
            className={`filter-btn ${filter === 'sold-out' ? 'active' : ''}`}
            onClick={() => setFilter('sold-out')}
          >
            Sold Out ({crops.filter(c => c.status === 'Sold Out').length})
          </button>
        </div>

        {filteredCrops.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌾</div>
            <h3>No crops found</h3>
            <p>{filter === 'all' ? 'Add your first crop to get started' : `No ${filter.replace('-', ' ')} crops`}</p>
            {filter === 'all' && (
              <button 
                className="btn-add"
                onClick={() => navigate('/farmer/crops/new')}
              >
                Add Your First Crop
              </button>
            )}
          </div>
        ) : (
          <div className="crops-grid">
            {filteredCrops.map((crop) => (
              <div key={crop._id} className="crop-card">
                <div className="crop-image">
                  {getCropEmoji(crop.name)}
                </div>
                <div className="crop-details">
                  <div className="crop-header-row">
                    <h3 className="crop-name">{crop.name}</h3>
                    <span className={`crop-status ${crop.status === 'Available' ? 'available' : 'sold-out'}`}>
                      {crop.status}
                    </span>
                  </div>
                  <p className="crop-category">{crop.category} · {crop.state}</p>
                  <div className="crop-info-row">
                    <span className="crop-price">₹{crop.price}/kg</span>
                    <span className="crop-quantity">{crop.quantity} kg available</span>
                  </div>
                  <p className="crop-location">📍 {crop.location}</p>
                  
                  <div className="crop-actions">
                    <button 
                      className="btn-toggle"
                      onClick={() => handleToggleStatus(crop._id, crop.status)}
                    >
                      {crop.status === 'Available' ? 'Mark Sold Out' : 'Mark Available'}
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(crop._id, crop.name)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCrops;