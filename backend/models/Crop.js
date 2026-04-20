const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add crop name'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please add category'],
    enum: ['Grains', 'Vegetables', 'Fruits', 'Oilseeds'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please add price']
  },
  quantity: {
    type: Number,
    required: [true, 'Please add quantity']
  },
  unit: {
    type: String,
    default: 'kg'
  },
  location: {
    type: String,
    required: [true, 'Please add location'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'Please add state'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  harvestMonth: {        // ADDED — stored as "YYYY-MM", e.g. "2025-02"
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmerName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'Sold Out'],
    default: 'Available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Crop', cropSchema);