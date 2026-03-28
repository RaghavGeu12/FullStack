const Review = require('../models/Review');
const Order = require('../models/Order');

// @desc    Create review
// @route   POST /api/reviews
// @access  Private (Buyer only)
const createReview = async (req, res) => {
  try {
    const { orderId, farmerId, qualityRating, costRating, comment } = req.body;

    // Validate both ratings are present and in range
    const qr = parseInt(qualityRating);
    const cr = parseInt(costRating);

    if (!qr || !cr || ![qr, cr].every(r => r >= 1 && r <= 5)) {
      return res.status(400).json({ message: 'qualityRating and costRating must each be between 1 and 5' });
    }

    // Check if order exists and belongs to this buyer
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

    // Prevent duplicate review for same order
    const existingReview = await Review.findOne({ order: orderId });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this order' });
    }

    // Create review — pre('save') hook auto-computes overall rating
    const review = await Review.create({
      buyer:    req.user._id,
      buyerName: req.user.name,
      farmer:   farmerId,
      order:    orderId,
      qualityRating: qr,
      costRating:    cr,
      comment,
    });

    // ── Run aggregation pipeline to update farmer's avg stats ─────────────
    // Example: Buyer1 gave quality:3, cost:3 → Buyer2 gives quality:5, cost:5
    //   avgQualityRating = (3+5)/2 = 4.0
    //   avgCostRating    = (3+5)/2 = 4.0
    //   avgRating        = (4.0+4.0)/2 = 4.0  ⭐⭐⭐⭐
    // These are saved directly to the farmer's User document.
    const farmerStats = await Review.updateFarmerAverages(farmerId);

    res.status(201).json({ review, farmerStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews for a farmer (with aggregated stats)
// @route   GET /api/reviews/farmer/:farmerId
// @access  Public
const getFarmerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ farmer: req.params.farmerId })
      .sort({ createdAt: -1 });

    // Re-run pipeline so stats are always accurate even if called directly
    const stats = reviews.length > 0
      ? await Review.updateFarmerAverages(req.params.farmerId)
      : { avgRating: 0, avgQualityRating: 0, avgCostRating: 0, totalReviews: 0 };

    res.json({
      reviews,
      avgRating:        stats.avgRating,
      avgQualityRating: stats.avgQualityRating,
      avgCostRating:    stats.avgCostRating,
      totalReviews:     stats.totalReviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in buyer's reviews
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
  getBuyerReviews,
};