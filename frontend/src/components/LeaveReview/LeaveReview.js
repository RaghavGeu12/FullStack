import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Navbar from '../Navbar/Navbar';
import './LeaveReview.css';

const LeaveReview = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  const fetchCompletedOrders = async () => {
    try {
      const { data } = await api.get('/orders/my-orders');
      const completedOrders = data.filter(order => order.status === 'completed');
      setOrders(completedOrders);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch orders');
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!selectedOrder) {
      toast.error('Please select an order to review');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a review');
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/reviews', {
        orderId: selectedOrder._id,
        farmerId: selectedOrder.farmer,
        rating,
        comment
      });

      toast.success('Review submitted successfully!');
      setSelectedOrder(null);
      setRating(5);
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
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leave-review-page">
      <Navbar />
      
      <div className="leave-review-container">
        <div className="review-header">
          <h1 className="page-title">Leave Review ⭐</h1>
          <p className="page-subtitle">Share your experience with farmers</p>
        </div>

        <div className="review-content">
          {/* Orders List */}
          <div className="orders-section">
            <h3>Completed Orders</h3>
            {orders.length === 0 ? (
              <div className="no-orders">
                <p>No completed orders to review</p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div 
                    key={order._id}
                    className={`order-card ${selectedOrder?._id === order._id ? 'selected' : ''}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="order-info">
                      <h4>{order.orderId}</h4>
                      <p>{order.cropName} · {order.quantity} kg</p>
                      <p className="farmer-name">Farmer: {order.farmerName}</p>
                    </div>
                    <div className="order-price">
                      ₹{order.totalPrice.toLocaleString()}
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
                <h3>Review for {selectedOrder.farmerName}</h3>
                <p className="order-detail">Order: {selectedOrder.orderId} · {selectedOrder.cropName}</p>

                <form onSubmit={handleSubmitReview} className="review-form">
                  <div className="form-group">
                    <label>Rating</label>
                    <div className="rating-input">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`star ${star <= rating ? 'active' : ''}`}
                          onClick={() => setRating(star)}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <span className="rating-text">{rating} out of 5 stars</span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="comment">Your Review</label>
                    <textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows="5"
                      placeholder="Share your experience with this farmer..."
                      required
                    />
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn-cancel"
                      onClick={() => {
                        setSelectedOrder(null);
                        setRating(5);
                        setComment('');
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn-submit"
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="no-selection">
                <div className="no-selection-icon">⭐</div>
                <p>Select a completed order to leave a review</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveReview;