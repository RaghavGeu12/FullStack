const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    // Keeping your existing field names (buyer, farmer, order) intact
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    buyerName: {
      type: String,
      required: true,
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true, // one review per order
    },

    // ── NEW: two separate rating fields ──────────────────────────────────
    qualityRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    costRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    // overall average — auto-computed in pre('save'), never sent from client
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

// ── Auto-compute overall rating before every save ─────────────────────────────
reviewSchema.pre('save', function (next) {
  this.rating = parseFloat(((this.qualityRating + this.costRating) / 2).toFixed(2));
  next();
});

/**
 * updateFarmerAverages — Aggregation Pipeline
 *
 * Example:
 *   Buyer 1 → qualityRating: 3, costRating: 3
 *   Buyer 2 → qualityRating: 5, costRating: 5
 *
 *   Stage 1 $match     → get only this farmer's reviews
 *   Stage 2 $group     → avgQuality = (3+5)/2 = 4.0  |  avgCost = (3+5)/2 = 4.0
 *   Stage 3 $addFields → avgOverall = (4.0 + 4.0) / 2 = 4.0  ⭐⭐⭐⭐
 *   Stage 4 $project   → round all to 1 decimal
 *
 *   Result is saved to the farmer's User document automatically.
 */
reviewSchema.statics.updateFarmerAverages = async function (farmerId) {
  const pipeline = [
    // Stage 1: only this farmer's reviews
    {
      $match: { farmer: new mongoose.Types.ObjectId(farmerId) },
    },

    // Stage 2: $avg directly on raw fields — never avg-of-avg
    {
      $group: {
        _id: '$farmer',
        avgQuality:   { $avg: '$qualityRating' },
        avgCost:      { $avg: '$costRating' },
        totalReviews: { $sum: 1 },
      },
    },

    // Stage 3: overall = (avgQuality + avgCost) / 2
    {
      $addFields: {
        avgOverall: {
          $divide: [{ $add: ['$avgQuality', '$avgCost'] }, 2],
        },
      },
    },

    // Stage 4: round to 1 decimal and rename for output
    {
      $project: {
        _id: 0,
        avgQualityRating: { $round: ['$avgQuality', 1] },
        avgCostRating:    { $round: ['$avgCost',    1] },
        avgRating:        { $round: ['$avgOverall', 1] },
        totalReviews:     1,
      },
    },
  ];

  const result = await this.aggregate(pipeline);

  // No reviews yet → default everything to 0
  const stats = result[0] || {
    avgQualityRating: 0,
    avgCostRating:    0,
    avgRating:        0,
    totalReviews:     0,
  };

  // Persist computed stats to the farmer's User document
  await mongoose.model('User').findByIdAndUpdate(
    farmerId,
    { $set: stats },
    { new: true }
  );

  return stats;
};

module.exports = mongoose.model('Review', reviewSchema);