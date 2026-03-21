import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Navbar from '../Navbar/Navbar';
import './PlaceOrder.css';

const PlaceOrder = () => {
  const { cropId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
      toast.error('Crop not found');
      navigate('/buyer/browse');
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    if (quantity > crop.quantity) {
      toast.error(`Only ${crop.quantity} kg available`);
      return;
    }

    if (!deliveryAddress.trim()) {
      toast.error('Please provide delivery address');
      return;
    }

    setPlacing(true);

    try {
      await api.post('/orders', {
        cropId: crop._id,
        quantity: parseInt(quantity),
        deliveryAddress
      });

      toast.success('Order placed successfully!');
      navigate('/buyer/orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
      setPlacing(false);
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

  if (loading) {
    return (
      <div className="place-order-page">
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading...</p>
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
          ← Back to Browse
        </button>

        <h1 className="page-title">Place Order</h1>

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
              <p className="crop-stock">📦 {crop.quantity} kg available</p>
              <p className="crop-location">📍 {crop.location}, {crop.state}</p>
              <p className="crop-farmer">👨‍🌾 {crop.farmerName}</p>
              {crop.description && (
                <p className="crop-description">{crop.description}</p>
              )}
            </div>
          </div>

          {/* Order Form */}
          <div className="order-form-card">
            <h3>Order Details</h3>
            <form onSubmit={handlePlaceOrder}>
              <div className="form-group">
                <label htmlFor="quantity">Quantity (kg)</label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  max={crop.quantity}
                  required
                />
                <span className="helper-text">Max: {crop.quantity} kg</span>
              </div>

              <div className="form-group">
                <label htmlFor="address">Delivery Address</label>
                <textarea
                  id="address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  rows="3"
                  placeholder="Enter your complete delivery address"
                  required
                />
              </div>

              <div className="order-summary">
                <div className="summary-row">
                  <span>Price per kg:</span>
                  <span>₹{crop.price}</span>
                </div>
                <div className="summary-row">
                  <span>Quantity:</span>
                  <span>{quantity} kg</span>
                </div>
                <div className="summary-row total">
                  <span>Total Amount:</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-place-order"
                disabled={placing || crop.status === 'Sold Out'}
              >
                {placing ? 'Placing Order...' : crop.status === 'Sold Out' ? 'Sold Out' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;