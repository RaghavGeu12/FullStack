import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Navbar from '../Navbar/Navbar';
import './LeaveReview.css';

const StarRating = ({ label, icon, value, onChange, color }) => (
  <div className="rating-category">
    <div className="rating-label">
      <span className="rating-icon">{icon}</span>
      <span>{label}</span>
    </div>
    <div className="stars-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn ${star <= value ? 'active' : ''}`}
          style={{ '--star-color': color }}
          onClick={() => onChange(star)}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
      <span className="rating-badge" style={{ background: color }}>
        {value}/5
      </span>
    </div>
  </div>
);

const LeaveReview = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [qualityRating, setQualityRating] = useState(5);
  const [costRating, setCostRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const averageRating = ((qualityRating + costRating) / 2).toFixed(1);

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  const fetchCompletedOrders = async () => {
    try {
      const { data } = await api.get('/orders/my-orders');
      const completedOrders = data.filter(order => order.status === 'completed');
      setOrders(completedOrders);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return toast.error('Please select an order to review');
    if (!comment.trim()) return toast.error('Please write a review comment');

    setSubmitting(true);
    try {
      await api.post('/reviews', {
        orderId: selectedOrder._id,
        farmerId: selectedOrder.farmer,
        qualityRating,
        costRating,
        rating: parseFloat(averageRating), // overall average stored for backward compat
        comment,
      });
      toast.success('Review submitted successfully!');
      setSelectedOrder(null);
      setQualityRating(5);
      setCostRating(5);
      setComment('');
      fetchCompletedOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="leave-review-page">
        <Navbar />
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leave-review-page">
      <Navbar />
      <div className="leave-review-container">
        <div className="review-header">
          <h1 className="page-title">Leave a Review</h1>
          <p className="page-subtitle">Rate crop quality & value to help other buyers</p>
        </div>

        <div className="review-content">
          {/* Orders List */}
          <div className="orders-section">
            <h3 className="section-heading">Completed Orders</h3>
            {orders.length === 0 ? (
              <div className="no-orders">
                <span>🌾</span>
                <p>No completed orders to review yet</p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className={`order-card ${selectedOrder?._id === order._id ? 'selected' : ''}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="order-card-left">
                      <div className="crop-icon">🌿</div>
                      <div className="order-info">
                        <h4>{order.cropName}</h4>
                        <p className="order-meta">{order.orderId} · {order.quantity} kg</p>
                        <p className="farmer-name">👨‍🌾 {order.farmerName}</p>
                      </div>
                    </div>
                    <div className="order-right">
                      <div className="order-price">₹{order.totalPrice.toLocaleString()}</div>
                      {order.reviewed && (
                        <span className="reviewed-badge">Reviewed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review Form */}
          <div className="review-form-section">
            {selectedOrder ? (
              <>
                <div className="review-for-header">
                  <div>
                    <h3>Reviewing <span className="highlight">{selectedOrder.farmerName}</span></h3>
                    <p className="order-detail-chip">{selectedOrder.orderId} · {selectedOrder.cropName} · {selectedOrder.quantity} kg</p>
                  </div>
                </div>

                <form onSubmit={handleSubmitReview} className="review-form">
                  {/* Dual Rating */}
                  <div className="form-group ratings-group">
                    <label className="group-label">Rate Your Experience</label>
                    <div className="dual-ratings">
                      <StarRating
                        label="Crop Quality"
                        icon="🌾"
                        value={qualityRating}
                        onChange={setQualityRating}
                        color="#22c55e"
                      />
                      <div className="ratings-divider" />
                      <StarRating
                        label="Cost & Value"
                        icon="💰"
                        value={costRating}
                        onChange={setCostRating}
                        color="#f59e0b"
                      />
                    </div>

                    {/* Overall average pill */}
                    <div className="overall-rating">
                      <span className="overall-label">Overall Rating</span>
                      <div className="overall-score">
                        <span className="score-number">{averageRating}</span>
                        <span className="score-stars">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className={s <= Math.round(averageRating) ? 'star-filled' : 'star-empty'}>★</span>
                          ))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="form-group">
                    <label htmlFor="comment">Your Review</label>
                    <textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows="4"
                      placeholder="Share details about crop quality, delivery, and value for money..."
                      required
                    />
                    <span className="char-count">{comment.length} chars</span>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => {
                        setSelectedOrder(null);
                        setQualityRating(5);
                        setCostRating(5);
                        setComment('');
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-submit" disabled={submitting}>
                      {submitting ? 'Submitting...' : 'Submit Review ✓'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="no-selection">
                <div className="no-selection-icon">⭐</div>
                <p>Select a completed order from the left to leave your review</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveReview;