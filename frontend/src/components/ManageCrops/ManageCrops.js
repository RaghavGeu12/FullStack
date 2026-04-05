import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import Navbar from '../Navbar/Navbar';
import './ManageCrops.css';

const ManageCrops = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      toast.error(t('manageCrops.errorFetch'));
      setLoading(false);
    }
  };

  const handleDelete = async (cropId, cropName) => {
    if (window.confirm(t('manageCrops.confirmDelete', { name: cropName }))) {
      try {
        await api.delete(`/crops/${cropId}`);
        toast.success(t('manageCrops.successDelete'));
        fetchCrops();
      } catch (error) {
        toast.error(t('manageCrops.errorDelete'));
      }
    }
  };

  const handleToggleStatus = async (cropId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Available' ? 'Sold Out' : 'Available';
      await api.put(`/crops/${cropId}`, { status: newStatus });
      toast.success(t('manageCrops.successStatus', { status: newStatus }));
      fetchCrops();
    } catch (error) {
      toast.error(t('manageCrops.errorStatus'));
    }
  };

  const filteredCrops = filter === 'all'
    ? crops
    : crops.filter(crop => crop.status.toLowerCase().replace(' ', '-') === filter);

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
      <div className="manage-crops-page">
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{t('manageCrops.loading')}</p>
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
            <h1 className="page-title">{t('manageCrops.title')}</h1>
            <p className="page-subtitle">{t('manageCrops.subtitle')}</p>
          </div>
          <button className="btn-add-new" onClick={() => navigate('/farmer/crops/new')}>
            {t('manageCrops.addNewCrop')}
          </button>
        </div>

        <div className="filter-section">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            {t('manageCrops.all', { count: crops.length })}
          </button>
          <button
            className={`filter-btn ${filter === 'available' ? 'active' : ''}`}
            onClick={() => setFilter('available')}
          >
            {t('manageCrops.available', { count: crops.filter(c => c.status === 'Available').length })}
          </button>
          <button
            className={`filter-btn ${filter === 'sold-out' ? 'active' : ''}`}
            onClick={() => setFilter('sold-out')}
          >
            {t('manageCrops.soldOut', { count: crops.filter(c => c.status === 'Sold Out').length })}
          </button>
        </div>

        {filteredCrops.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌾</div>
            <h3>{t('manageCrops.noCropsFound')}</h3>
            <p>
              {filter === 'all'
                ? t('manageCrops.addFirstMsg')
                : t('manageCrops.noFilterCrops', { filter: filter.replace('-', ' ') })}
            </p>
            {filter === 'all' && (
              <button className="btn-add" onClick={() => navigate('/farmer/crops/new')}>
                {t('manageCrops.addFirstCrop')}
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
                      {crop.status === 'Available'
                        ? t('manageCrops.availableStatus')
                        : t('manageCrops.soldOutStatus')}
                    </span>
                  </div>
                  <p className="crop-category">{crop.category} · {crop.state}</p>
                  <div className="crop-info-row">
                    <span className="crop-price">
                      {t('manageCrops.pricePerKg', { price: crop.price })}
                    </span>
                    <span className="crop-quantity">
                      {t('manageCrops.quantityAvail', { qty: crop.quantity })}
                    </span>
                  </div>
                  <p className="crop-location">📍 {crop.location}</p>

                  <div className="crop-actions">
                    <button
                      className="btn-toggle"
                      onClick={() => handleToggleStatus(crop._id, crop.status)}
                    >
                      {crop.status === 'Available'
                        ? t('manageCrops.markSoldOut')
                        : t('manageCrops.markAvailable')}
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(crop._id, crop.name)}
                    >
                      {t('manageCrops.delete')}
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