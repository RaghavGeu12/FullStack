const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['farmer', 'buyer', 'admin'],
    required: [true, 'Please specify role']
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Blocked'],
    default: 'Active'
  },

  // ── Farmer rating averages (updated by aggregation pipeline after every review) ──
  // Example: Buyer1 rates quality:3, cost:3 → Buyer2 rates quality:5, cost:5
  //   avgQualityRating = (3+5)/2 = 4.0
  //   avgCostRating    = (3+5)/2 = 4.0
  //   avgRating        = (4.0+4.0)/2 = 4.0  ⭐⭐⭐⭐
  avgRating: {
    type: Number,
    default: 0
  },
  avgQualityRating: {
    type: Number,
    default: 0
  },
  avgCostRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);