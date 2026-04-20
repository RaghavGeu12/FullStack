const Review = require('../models/Review');
const Order = require('../models/Order');


const createReview = async (req, res) => {
  try {
    const { orderId, farmerId, qualityRating, costRating, comment } = req.body;

   
    const qr = parseInt(qualityRating);
    const cr = parseInt(costRating);

    if (!qr || !cr || ![qr, cr].every(r => r >= 1 && r <= 5)) {
      return res.status(400).json({ message: 'qualityRating and costRating must each be between 1 and 5' });
    }

    
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

   
    const existingReview = await Review.findOne({ order: orderId });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this order' });
    }

  
    const review = await Review.create({
      buyer:    req.user._id,
      buyerName: req.user.name,
      farmer:   farmerId,
      order:    orderId,
      qualityRating: qr,
      costRating:    cr,
      comment,
    });

    
    const farmerStats = await Review.updateFarmerAverages(farmerId);

    res.status(201).json({ review, farmerStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getFarmerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ farmer: req.params.farmerId })
      .sort({ createdAt: -1 });


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