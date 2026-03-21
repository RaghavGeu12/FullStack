const express = require('express');
const router = express.Router();
const {
  createOrder,
  getBuyerOrders,
  getFarmerOrders,
  getOrderById,
  updateOrderStatus,
  getBuyerStats
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('buyer'), createOrder);
router.get('/my-orders', protect, authorize('buyer'), getBuyerOrders);
router.get('/farmer/orders', protect, authorize('farmer'), getFarmerOrders);
router.get('/stats/buyer', protect, authorize('buyer'), getBuyerStats);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, authorize('farmer'), updateOrderStatus);

module.exports = router;
