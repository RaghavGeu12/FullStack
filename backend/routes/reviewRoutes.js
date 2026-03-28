const express = require('express');
const router = express.Router();
const {
  createReview,
  getFarmerReviews,
  getBuyerReviews,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

// POST /api/reviews — submit a new review (buyer only)
router.post('/', protect, authorize('buyer'), createReview);

// GET /api/reviews/farmer/:farmerId — get all reviews + avg stats for a farmer (public)
router.get('/farmer/:farmerId', getFarmerReviews);

// GET /api/reviews/my-reviews — get logged-in buyer's own reviews
router.get('/my-reviews', protect, authorize('buyer'), getBuyerReviews);

module.exports = router;