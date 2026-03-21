const Review = require('../models/Review');
const Order = require('../models/Order');

// @desc    Create review
// @route   POST /api/reviews
// @access  Private (Buyer only)
const createReview = async (req, res) => {
  try {
    const { orderId, farmerId, rating, comment } = req.body;

    // Check if order exists and belongs to buyer
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to review this order' });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed orders' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ order: orderId });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this order' });
    }

    // Create review
    const review = await Review.create({
      buyer: req.user._id,
      buyerName: req.user.name,
      farmer: farmerId,
      order: orderId,
      rating,
      comment
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get farmer reviews
// @route   GET /api/reviews/farmer/:farmerId
// @access  Public
const getFarmerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ farmer: req.params.farmerId })
      .sort({ createdAt: -1 });
    
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    res.json({
      reviews,
      avgRating: avgRating.toFixed(1),
      totalReviews: reviews.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get buyer's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private (Buyer only)
const getBuyerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ buyer: req.user._id })
      .populate('order', 'orderId cropName')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getFarmerReviews,
  getBuyerReviews
};
