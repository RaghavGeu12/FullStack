const Order = require('../models/Order');
const Crop = require('../models/Crop');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Buyer only)
const createOrder = async (req, res) => {
  try {
    const { cropId, quantity, deliveryAddress } = req.body;

    // Get crop details
    const crop = await Crop.findById(cropId).populate('farmer', 'name');

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    // Check if enough quantity available
    if (crop.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient quantity available' });
    }

    // Calculate total price
    const totalPrice = crop.price * quantity;

    // Create order
    const order = await Order.create({
      buyer: req.user._id,
      buyerName: req.user.name,
      crop: crop._id,
      cropName: crop.name,
      farmer: crop.farmer._id,
      farmerName: crop.farmerName,
      quantity,
      totalPrice,
      deliveryAddress
    });

    // Update crop quantity
    crop.quantity -= quantity;
    if (crop.quantity === 0) {
      crop.status = 'Sold Out';
    }
    await crop.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get buyer's orders
// @route   GET /api/orders/my-orders
// @access  Private (Buyer only)
const getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('crop', 'name price')
      .sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get farmer's orders
// @route   GET /api/orders/farmer/orders
// @access  Private (Farmer only)
const getFarmerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ farmer: req.user._id })
      .populate('crop', 'name price')
      .populate('buyer', 'name email phone')
      .sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('crop', 'name price image')
      .populate('buyer', 'name email phone address')
      .populate('farmer', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Make sure user is buyer or farmer of this order
    if (
      order.buyer.toString() !== req.user._id.toString() &&
      order.farmer.toString() !== req.user._id.toString()
    ) {
      return res.status(401).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Farmer only)
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Make sure user is the farmer of this order
    if (order.farmer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this order' });
    }

    order.status = req.body.status || order.status;
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order statistics for buyer
// @route   GET /api/orders/stats/buyer
// @access  Private (Buyer only)
const getBuyerStats = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id });
    
    const stats = {
      ordersPlaced: orders.length,
      completed: orders.filter(o => o.status === 'completed').length,
      totalSpent: orders.reduce((sum, order) => sum + order.totalPrice, 0),
      pending: orders.filter(o => o.status === 'pending').length
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getBuyerOrders,
  getFarmerOrders,
  getOrderById,
  updateOrderStatus,
  getBuyerStats
};
