const express = require('express');
const router = express.Router();
const {
  createReview,
  getFarmerReviews,
  getBuyerReviews,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');


router.post('/', protect, authorize('buyer'), createReview);


router.get('/farmer/:farmerId', getFarmerReviews);

router.get('/my-reviews', protect, authorize('buyer'), getBuyerReviews);

module.exports = router;