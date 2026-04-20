const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    
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
      unique: true, 
    },

    
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

reviewSchema.pre('save', function (next) {
  this.rating = parseFloat(((this.qualityRating + this.costRating) / 2).toFixed(2));
  next();
});


reviewSchema.statics.updateFarmerAverages = async function (farmerId) {
  const pipeline = [
    
    {
      $match: { farmer: new mongoose.Types.ObjectId(farmerId) },
    },


    {
      $group: {
        _id: '$farmer',
        avgQuality:   { $avg: '$qualityRating' },
        avgCost:      { $avg: '$costRating' },
        totalReviews: { $sum: 1 },
      },
    },

    {
      $addFields: {
        avgOverall: {
          $divide: [{ $add: ['$avgQuality', '$avgCost'] }, 2],
        },
      },
    },

   
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


  const stats = result[0] || {
    avgQualityRating: 0,
    avgCostRating:    0,
    avgRating:        0,
    totalReviews:     0,
  };

 
  await mongoose.model('User').findByIdAndUpdate(
    farmerId,
    { $set: stats },
    { new: true }
  );

  return stats;
};

module.exports = mongoose.model('Review', reviewSchema);