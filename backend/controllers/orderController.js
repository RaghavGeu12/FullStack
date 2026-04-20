const Order = require('../models/Order');
const Crop = require('../models/Crop');


const createOrder = async (req, res) => {
  try {
    const { cropId, quantity, deliveryAddress } = req.body;

    
    const crop = await Crop.findById(cropId).populate('farmer', 'name');

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    
    if (crop.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient quantity available' });
    }

   
    const totalPrice = crop.price * quantity;

  
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


const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('crop', 'name price image')
      .populate('buyer', 'name email phone address')
      .populate('farmer', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

  
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


const updateOrderStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    
    if (order.farmer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this order' });
    }

   
    if (status === 'cancelled') {
      if (!rejectionReason || rejectionReason.trim() === '') {
        return res.status(400).json({ message: 'A rejection reason is required when declining an order' });
      }

      
      const crop = await Crop.findById(order.crop);
      if (crop) {
        crop.quantity += order.quantity;
        if (crop.status === 'Sold Out' && crop.quantity > 0) {
          crop.status = 'Available';
        }
        await crop.save();
      }

      order.rejectionReason = rejectionReason.trim();
    }

    order.status = status || order.status;
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


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