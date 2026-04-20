import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import Navbar from '../Navbar/Navbar';
import './PlaceOrder.css';

const PlaceOrder = () => {
  const { cropId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');

  useEffect(() => {
    fetchCrop();
  }, [cropId]);

  const fetchCrop = async () => {
    try {
      const { data } = await api.get(`/crops/${cropId}`);
      setCrop(data);
      setLoading(false);
    } catch (error) {
      toast.error(t('placeOrder.errorNotFound'));
      navigate('/buyer/browse');
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (quantity <= 0) {
      toast.error(t('placeOrder.errorQty'));
      return;
    }

    if (quantity > crop.quantity) {
      toast.error(t('placeOrder.errorMaxQty', { qty: crop.quantity }));
      return;
    }

    if (!deliveryAddress.trim()) {
      toast.error(t('placeOrder.errorAddress'));
      return;
    }

    setPlacing(true);

    try {
      await api.post('/orders', {
        cropId: crop._id,
        quantity: parseInt(quantity),
        deliveryAddress
      });

      toast.success(t('placeOrder.successMsg'));
      navigate('/buyer/orders');
    } catch (error) {
      toast.error(error.response?.data?.message || t('placeOrder.errorFailed'));
      setPlacing(false);
    }
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
      <div className="place-order-page">
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{t('placeOrder.loading')}</p>
        </div>
      </div>
    );
  }

  const totalPrice = crop.price * quantity;

  return (
    <div className="place-order-page">
      <Navbar />

      <div className="place-order-container">
        <button className="btn-back" onClick={() => navigate('/buyer/browse')}>
          {t('placeOrder.backToBrowse')}
        </button>

        <h1 className="page-title">{t('placeOrder.title')}</h1>

        <div className="order-content">
          {/* Crop Details */}
          <div className="crop-preview">
            <div className="crop-preview-image">
              {getCropEmoji(crop.name)}
            </div>
            <div className="crop-preview-details">
              <h2>{crop.name}</h2>
              <p className="crop-meta">{crop.category} · {crop.state}</p>
              <p className="crop-price">₹{crop.price}/kg</p>
              <p className="crop-stock">
                📦 {crop.quantity} {t('placeOrder.available')}
              </p>
              <p className="crop-location">📍 {crop.location}, {crop.state}</p>
              <p className="crop-farmer">👨‍🌾 {crop.farmerName}</p>
              {crop.description && (
                <p className="crop-description">{crop.description}</p>
              )}
            </div>
          </div>

          
          <div className="order-form-card">
            <h3>{t('placeOrder.orderDetails')}</h3>
            <form onSubmit={handlePlaceOrder}>
              <div className="form-group">
                <label htmlFor="quantity">{t('placeOrder.quantityLabel')}</label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  max={crop.quantity}
                  required
                />
                <span className="helper-text">
                  {t('placeOrder.maxQty', { qty: crop.quantity })}
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="address">{t('placeOrder.addressLabel')}</label>
                <textarea
                  id="address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  rows="3"
                  placeholder={t('placeOrder.addressPlaceholder')}
                  required
                />
              </div>

              <div className="order-summary">
                <div className="summary-row">
                  <span>{t('placeOrder.pricePerKg')}</span>
                  <span>₹{crop.price}</span>
                </div>
                <div className="summary-row">
                  <span>{t('placeOrder.quantity')}</span>
                  <span>{t('placeOrder.quantityKg', { qty: quantity })}</span>
                </div>
                <div className="summary-row total">
                  <span>{t('placeOrder.totalAmount')}</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn-place-order"
                disabled={placing || crop.status === 'Sold Out'}
              >
                {placing
                  ? t('placeOrder.placingOrder')
                  : crop.status === 'Sold Out'
                  ? t('placeOrder.soldOut')
                  : t('placeOrder.placeOrderBtn')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;